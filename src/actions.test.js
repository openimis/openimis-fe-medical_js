import { describe, expect, it, vi } from "vitest";

// Only fe-core's two dispatchers are stubbed; the formatters are real, imported
// from their defining modules because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
  graphqlWithVariables: vi.fn((operation, variables, type, meta) => ({ operation, variables, type, meta })),
}));

vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/api")),
  ...core,
}));

const actions = await import("./actions");
const { globalId } = await import("@openimis/fe-core/testing");

const mm = { getRef: (key) => (key === "medical.MedicalItemsPicker.projection" ? ["id", "code", "name"] : null) };

const query = (result) => result.payload.replace(/\s+/g, " ");
const operation = (result) => result.operation.replace(/\s+/g, " ");
const gql = (ms) => actions.formatMedicalItemOrServiceGQL(mm, ms).replace(/\s+/g, " ");
const thunk = (creator) => {
  const dispatch = vi.fn();
  creator()(dispatch);
  return dispatch.mock.calls.map(([action]) => action);
};

describe("medical actions", () => {
  describe("searches", () => {
    it.each([
      ["services", "fetchMedicalServicesSummaries", "MEDICAL_SERVICES_SUMMARIES", "medicalServices", "packagetype"],
      ["items", "fetchMedicalItemsSummaries", "MEDICAL_ITEMS_SUMMARIES", "medicalItems", "package"],
    ])("asks for a counted page of %s summaries", (_label, creator, type, entity, field) => {
      const result = actions[creator](mm, ["first: 10", 'code_Icontains: "A"']);

      expect(result.type).toBe(type);
      expect(query(result)).toContain(`${entity}(first: 10,code_Icontains: "A") { totalCount`);
      expect(query(result)).toContain(`uuid,code,name,`);
      expect(query(result)).toContain(field);
    });

    it("searches items for the picker by the typed text", () => {
      const result = actions.fetchMedicalItems(mm, null, "para", null);

      expect(result.type).toBe("MEDICAL_ITEMS");
      expect(result.meta).toEqual(['str: "para"']);
      expect(query(result)).toContain('medicalItems(str: "para")');
      expect(query(result)).toContain("id,code,name");
    });

    it("does not repeat the picker search for filters it has already answered", () => {
      core.graphql.mockClear();
      const result = actions.fetchMedicalItems(mm, null, "para", ['str: "para"']);

      expect(core.graphql).not.toHaveBeenCalled();
      expect(typeof result).toBe("function");
    });
  });

  describe("loading one record", () => {
    it.each([
      ["service", "fetchMedicalService", "MEDICAL_SERVICE_OVERVIEW", "medicalServices"],
      ["item", "fetchMedicalItem", "MEDICAL_ITEM_OVERVIEW", "medicalItems"],
    ])("loads a %s by uuid with its history", (_label, creator, type, entity) => {
      const result = actions[creator](mm, "uuid-1");

      expect(result.type).toBe(type);
      expect(query(result)).toContain(`${entity}(uuid: "uuid-1", showHistory: true)`);
      expect(query(result)).not.toContain("totalCount");
    });

    it.each([
      ["service", "fetchMedicalService", "medicalServices"],
      ["item", "fetchMedicalItem", "medicalItems"],
    ])("looks a %s up by the mutation that created it when there is no uuid", (_label, creator, entity) => {
      expect(query(actions[creator](mm, null, "cmid-1"))).toContain(`${entity}(clientMutationId: "cmid-1")`);
    });

    it("asks for the linked services and items of a service", () => {
      const result = query(actions.fetchMedicalService(mm, "uuid-1"));

      expect(result).toContain("serviceserviceSet{id service {id code name } qtyProvided, priceAsked, scpDate}");
      expect(result).toContain("servicesLinked{id item {id code name } qtyProvided, priceAsked, pcpDate}");
      expect(result).toContain("manualPrice");
    });

    it("does not accumulate linked projections across calls", () => {
      actions.fetchMedicalService(mm, "uuid-1");
      const result = query(actions.fetchMedicalService(mm, "uuid-1"));

      expect(result.match(/serviceserviceSet/g)).toHaveLength(1);
    });

    it.each([
      ["service", "fetchMedicalServiceMutation", "MEDICAL_SERVICE", "medicalServices"],
      ["item", "fetchMedicalItemMutation", "MEDICAL_ITEM", "medicalItems"],
    ])("finds the uuid of the %s a mutation created", (_label, creator, type, entity) => {
      const result = actions[creator](mm, "cmid-1");

      expect(result.type).toBe(type);
      expect(query(result)).toContain(`${entity}(clientMutationId:"cmid-1")`);
      expect(query(result)).toContain("edges { node { uuid } }");
    });
  });

  describe("mutations", () => {
    const service = { uuid: "uuid-1", code: "S1", name: "Consultation", patientCategory: 15 };

    it.each([
      ["createMedicalService", "createService", "MEDICAL_SERVICE_MUTATION_REQ", "MEDICAL_SERVICE_CREATE_RESP",
        "MEDICAL_SERVICE_MUTATION_ERR"],
      ["updateMedicalService", "updateService", "MEDICAL_SERVICE_MUTATION_REQ", "MEDICAL_SERVICE_UPDATE_RESP",
        "MEDICAL_SERVICE_MUTATION_ERR"],
      ["createMedicalItem", "createItem", "MEDICAL_ITEM_MUTATION_REQ", "MEDICAL_ITEM_CREATE_RESP",
        "MEDICAL_ITEM_MUTATION_ERR"],
      ["updateMedicalItem", "updateItem", "MEDICAL_ITEM_MUTATION_REQ", "MEDICAL_ITEM_UPDATE_RESP",
        "MEDICAL_ITEM_MUTATION_ERR"],
    ])("%s sends %s and records the mutation it sent", (creator, mutationName, req, resp, err) => {
      const result = actions[creator](mm, service, "Save");

      expect(result.type).toEqual([req, resp, err]);
      expect(query(result)).toContain(`mutation ${mutationName} { ${mutationName}( input: {`);
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(query(result)).toContain('clientMutationLabel: "Save"');
      expect(query(result)).toContain('code: "S1"');
      expect(result.meta).toMatchObject({ clientMutationLabel: "Save" });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it.each([
      ["deleteMedicalService", "deleteService", "MEDICAL_SERVICE"],
      ["deleteMedicalItem", "deleteItem", "MEDICAL_ITEM"],
    ])("%s deletes by uuid and tags the record with the mutation id", (creator, mutationName, prefix) => {
      const record = { uuid: "uuid-1" };
      const result = actions[creator](mm, record, "Delete");

      expect(result.type).toEqual([`${prefix}_MUTATION_REQ`, `${prefix}_DELETE_RESP`, `${prefix}_MUTATION_ERR`]);
      expect(query(result)).toContain(`${mutationName}( input: {`);
      expect(query(result)).toContain('uuids: ["uuid-1"]');
      expect(record.clientMutationId).toBe(result.meta.clientMutationId);
    });

    it.each([
      ["service", "medicalServicesValidationCheck", "validateServiceCode(serviceCode: $serviceCode)",
        "SERVICES_FIELDS_VALIDATION", { serviceCode: "S1" }],
      ["item", "medicalItemsValidationCheck", "validateItemCode(itemCode: $itemCode)",
        "ITEMS_FIELDS_VALIDATION", { itemCode: "I1" }],
    ])("checks a %s code with variables rather than inlining it", (_label, creator, field, type, variables) => {
      const result = actions[creator](mm, variables);

      expect(result.type).toBe(type);
      expect(result.variables).toBe(variables);
      expect(operation(result)).toContain(`isValid: ${field}`);
    });

    it.each([
      ["newMedicalService", "MEDICAL_SERVICE_NEW"],
      ["newMedicalItem", "MEDICAL_ITEM_NEW"],
      ["medicalServicesSetValid", "SERVICES_FIELDS_VALIDATION_SET_VALID"],
      ["medicalServicesValidationClear", "SERVICES_FIELDS_VALIDATION_CLEAR"],
      ["medicalItemsSetValid", "ITEMS_FIELDS_VALIDATION_SET_VALID"],
      ["medicalItemsValidationClear", "ITEMS_FIELDS_VALIDATION_CLEAR"],
      ["clearServiceForm", "CLEAR_SERVICE_FORM"],
      ["clearItemForm", "CLEAR_ITEM_FORM"],
    ])("%s dispatches %s", (creator, type) => {
      expect(thunk(actions[creator])).toEqual([expect.objectContaining({ type })]);
    });
  });

  describe("formatMedicalItemOrServiceGQL", () => {
    it("writes each field that has a value", () => {
      const result = gql({
        uuid: "uuid-1",
        code: "S1",
        name: "Consultation",
        type: "C",
        price: 12.5,
        quantity: 3,
        maximumAmount: 100,
        careType: "O",
        frequency: 7,
        patientCategory: 15,
        category: "C",
        level: "S",
        package: "box",
      });

      [
        'uuid: "uuid-1"', 'code: "S1"', 'name: "Consultation"', 'type: "C"', 'price: "12.5"', 'quantity: "3"',
        'maximumAmount: "100"', 'careType: "O"', 'frequency: "7"', "patientCategory: 15", 'category: "C"',
        'level: "S"', 'package: "box"',
      ].forEach((fragment) => expect(result).toContain(fragment));
    });

    it("leaves out fields that were never filled", () => {
      const result = gql({ code: "S1", patientCategory: 5 });

      ["uuid:", "name:", "price:", "quantity:", "careType:", "category:", "packagetype:", "manualPrice:"]
        .forEach((fragment) => expect(result).not.toContain(fragment));
    });

    it("sends a zero price", () => {
      expect(gql({ price: 0, patientCategory: 15 })).toContain('price: "0"');
    });

    it("treats a blank category as no category", () => {
      expect(gql({ category: " ", patientCategory: 15 })).not.toContain("category:");
    });

    it.each([
      [true, "1"],
      [false, "0"],
      [undefined, "0"],
    ])("sends manual price %s as %s alongside the package type", (manualPrice, expected) => {
      const result = gql({ packagetype: "P", manualPrice, patientCategory: 15 });

      expect(result).toContain('packagetype: "P"');
      expect(result).toContain(`manualPrice: "${expected}"`);
    });

    it("sends the linked services and items, dropping rows with nothing picked", () => {
      const result = gql({
        patientCategory: 15,
        serviceserviceSet: [
          { service: { id: globalId("ServiceGQLType", "11") }, priceAsked: 10, qtyProvided: 2 },
          { service: null, priceAsked: 1, qtyProvided: 1 },
        ],
        servicesLinked: [{ item: { id: "22" }, priceAsked: 3.456, qtyProvided: 1 }],
      });

      expect(result).toContain('services: [ { serviceId: 11 priceAsked: "10.00" qtyProvided: "2.00" status: 1 } ]');
      expect(result).toContain('items: [ { itemId: 22 priceAsked: "3.46" qtyProvided: "1.00" status: 1 } ]');
    });

    // Currently fails: fe-core's formatGQLString escapes the quote first and then the
    // backslash it just inserted, so a quote in the name reaches the server as \\".
    it.fails("escapes a quote in the name", () => {
      expect(gql({ name: 'Paracetamol "500"', patientCategory: 15 })).toContain('name: "Paracetamol \\"500\\""');
    });

    // Currently fails: the code is interpolated without formatGQLString, so a backslash
    // typed into it is sent as an escape character and the mutation is malformed.
    it.fails("escapes a backslash in the code", () => {
      expect(gql({ code: "A\\1", patientCategory: 15 })).toContain('code: "A\\\\1"');
    });
  });

  describe("formatDetail", () => {
    it("leaves out a price or quantity that was cleared", () => {
      const result = actions.formatDetail("item", { item: { id: "22" }, priceAsked: null, qtyProvided: null })
        .replace(/\s+/g, " ");

      expect(result).toBe("{ itemId: 22 status: 1 }");
    });

    it("sends nothing for missing details", () => {
      expect(actions.formatDetails("item", null)).toBe("");
      expect(actions.formatDetails("item", undefined)).toBe("");
    });
  });
});
