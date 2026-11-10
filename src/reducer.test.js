import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { default: reducer } = await import("./reducer");
const { graphqlErrors, relayPage, serverError } = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, type, data, meta) => dispatch(state, `${type}_RESP`, { payload: { data }, meta });
const fail = (state, type, payload = serverError(500, "Internal Server Error", "boom")) =>
  dispatch(state, `${type}_ERR`, { payload });

const SERVER_ERROR = { code: 500, message: "Internal Server Error", detail: "boom" };

describe("medical reducer", () => {
  describe("initialisation", () => {
    it("starts with nothing loaded and nothing in flight", () => {
      const state = initial();

      expect(state.medicalService).toBeNull();
      expect(state.medicalItem).toBeNull();
      expect(state.medicalServicesSummaries).toBeNull();
      expect(state.medicalItemsSummaries).toBeNull();
      expect(state.fetchedMedicalService).toBe(false);
      expect(state.fetchedMedicalItem).toBe(false);
      expect(state.submittingMutation).toBe(false);
      expect(state.mutation).toEqual({});
    });

    it("counts nothing before the first page arrives", () => {
      expect(initial().medicalServicesPageInfo).toEqual({ totalCount: 0 });
      expect(initial().medicalItemsPageInfo).toEqual({ totalCount: 0 });
    });

    it("returns the same state object for an unrelated action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe.each([
    ["services", "MEDICAL_SERVICES_SUMMARIES", "medicalServices", "MedicalServicesSummaries", "medicalServicesPageInfo"],
    ["items", "MEDICAL_ITEMS_SUMMARIES", "medicalItems", "MedicalItemsSummaries", "medicalItemsPageInfo"],
  ])("the %s searcher", (_label, type, entity, suffix, pageInfoField) => {
    const list = `${suffix.charAt(0).toLowerCase()}${suffix.slice(1)}`;
    const page = {
      [entity]: relayPage([{ uuid: "u-1", code: "A1" }, { uuid: "u-2", code: "A2" }], {
        totalCount: 12,
        pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
      }),
    };

    it("empties the list and marks the search as running", () => {
      const stale = { ...initial(), [list]: [{ uuid: "old" }], [`fetched${suffix}`]: ["old filter"] };
      const state = dispatch(stale, `${type}_REQ`);

      expect(state[`fetching${suffix}`]).toBe(true);
      expect(state[`fetched${suffix}`]).toBeNull();
      expect(state[list]).toBeNull();
    });

    it("stores the rows, the count and the cursors, and remembers the filters it answered", () => {
      const state = respond(dispatch(initial(), `${type}_REQ`), type, page, ["code: \"A\""]);

      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`fetched${suffix}`]).toEqual(["code: \"A\""]);
      expect(state[list]).toEqual([{ uuid: "u-1", code: "A1" }, { uuid: "u-2", code: "A2" }]);
      expect(state[pageInfoField]).toMatchObject({ totalCount: 12, hasNextPage: true, endCursor: "cursor-2" });
      expect(state[`error${suffix}`]).toBeNull();
    });

    it("reports an empty page rather than throwing", () => {
      const state = respond(initial(), type, { [entity]: null });

      expect(state[list]).toEqual([]);
      expect(state[pageInfoField]).toEqual({});
    });

    it("surfaces a data error from the search", () => {
      const state = dispatch(initial(), `${type}_RESP`, {
        payload: { data: { [entity]: relayPage([]) }, ...graphqlErrors("bad filter") },
      });

      expect(state[`error${suffix}`]).toMatchObject({ detail: "bad filter" });
    });

    it("stops the search and formats a transport failure", () => {
      const state = fail(dispatch(initial(), `${type}_REQ`), type);

      expect(state[`fetching${suffix}`]).toBeFalsy();
      expect(state[`error${suffix}`]).toEqual(SERVER_ERROR);
    });
  });

  describe.each([
    ["service", "MEDICAL_SERVICE_OVERVIEW", "medicalServices", "MedicalService", "medicalService", "CLEAR_SERVICE_FORM"],
    ["item", "MEDICAL_ITEM_OVERVIEW", "medicalItems", "MedicalItem", "medicalItem", "CLEAR_ITEM_FORM"],
  ])("loading one %s", (_label, type, entity, suffix, field, clearType) => {
    it("marks the record as loading and clears the previous error", () => {
      const stale = { ...initial(), [`error${suffix}`]: SERVER_ERROR, [`fetched${suffix}`]: true };
      const state = dispatch(stale, `${type}_REQ`);

      expect(state[`fetching${suffix}`]).toBe(true);
      expect(state[`fetched${suffix}`]).toBe(false);
      expect(state[`error${suffix}`]).toBeNull();
    });

    it("keeps the first row of the response as the record being edited", () => {
      const state = respond(initial(), type, {
        [entity]: relayPage([{ uuid: "u-1", code: "A1" }, { uuid: "u-1-old", code: "A1" }]),
      });

      expect(state[field]).toEqual({ uuid: "u-1", code: "A1" });
      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`fetched${suffix}`]).toBe(true);
      expect(state[`error${suffix}`]).toBeNull();
    });

    it("holds no record when the response is empty", () => {
      expect(respond(initial(), type, { [entity]: relayPage([]) })[field]).toBeNull();
      expect(respond(initial(), type, { [entity]: null })[field]).toBeNull();
    });

    it("surfaces a data error from the lookup", () => {
      const state = dispatch(initial(), `${type}_RESP`, {
        payload: { data: { [entity]: null }, ...graphqlErrors("not found") },
      });

      expect(state[`error${suffix}`]).toMatchObject({ detail: "not found" });
    });

    it("formats a transport failure", () => {
      const state = fail(dispatch(initial(), `${type}_REQ`), type);

      expect(state[`fetched${suffix}`]).toBe(false);
      expect(state[`error${suffix}`]).toEqual(SERVER_ERROR);
    });

    // Currently fails: the failure case never resets the loading flag, so the form's
    // ProgressOrError keeps spinning next to the error it is reporting.
    it.fails("stops loading when the lookup fails", () => {
      expect(fail(dispatch(initial(), `${type}_REQ`), type)[`fetching${suffix}`]).toBe(false);
    });

    it("forgets the record when the form is closed", () => {
      const loaded = respond(initial(), type, { [entity]: relayPage([{ uuid: "u-1" }]) });

      expect(dispatch(loaded, clearType)[field]).toBeNull();
    });
  });

  describe("the item picker search", () => {
    it("empties the list while the search runs", () => {
      const stale = { ...initial(), medicalItems: [{ uuid: "old" }], errorMedicalItems: SERVER_ERROR };
      const state = dispatch(stale, "MEDICAL_ITEMS_REQ");

      expect(state.fetchingMedicalItems).toBe(true);
      expect(state.medicalItems).toBeNull();
      expect(state.errorMedicalItems).toBeNull();
    });

    it("stores the rows and remembers the filters it answered", () => {
      const state = respond(initial(), "MEDICAL_ITEMS", { medicalItems: relayPage([{ uuid: "u-1" }]) }, ["str: \"par\""]);

      expect(state.medicalItems).toEqual([{ uuid: "u-1" }]);
      expect(state.fetchedMedicalItems).toEqual(["str: \"par\""]);
      expect(state.fetchingMedicalItems).toBe(false);
    });

    it("formats a transport failure", () => {
      expect(fail(initial(), "MEDICAL_ITEMS").errorMedicalItems).toEqual(SERVER_ERROR);
    });
  });

  describe.each([
    ["service", "SERVICES_FIELDS_VALIDATION", "medicalService"],
    ["item", "ITEMS_FIELDS_VALIDATION", "medicalItem"],
  ])("the %s code check", (_label, type, field) => {
    const validating = () => dispatch(initial(), `${type}_REQ`);

    it("marks the code as validating and not yet valid while the check runs", () => {
      expect(validating().validationFields[field]).toEqual({
        isValidating: true,
        isValid: false,
        validationError: null,
      });
    });

    it.each([true, false])("takes the verdict %s from the response", (isValid) => {
      expect(respond(validating(), type, { isValid }).validationFields[field]).toEqual({
        isValidating: false,
        isValid,
        validationError: null,
      });
    });

    it("reports a transport failure as invalid", () => {
      expect(fail(validating(), type).validationFields[field]).toEqual({
        isValidating: false,
        isValid: false,
        validationError: SERVER_ERROR,
      });
    });

    // Currently fails: the reducer reads action.payload?.data.isValid, and a GraphQL
    // error response that carries no data makes that throw a TypeError.
    it.fails("reports a GraphQL error that came without data", () => {
      const state = dispatch(validating(), `${type}_RESP`, { payload: graphqlErrors("bad query") });

      expect(state.validationFields[field]).toMatchObject({
        isValidating: false,
        validationError: { detail: "bad query" },
      });
    });

    it("marks the code valid without asking the server", () => {
      expect(dispatch(validating(), `${type}_SET_VALID`).validationFields[field]).toEqual({
        isValidating: false,
        isValid: true,
        validationError: null,
      });
    });

    it("forgets the verdict on clear", () => {
      const checked = respond(validating(), type, { isValid: true });
      const state = dispatch(checked, `${type}_CLEAR`);

      expect(state.validationFields[field]).toMatchObject({ isValid: false, validationError: null });
    });

    // Currently fails: clearing sets isValidating true, so ValidatedTextInput shows a
    // spinner for a check that was cancelled rather than started.
    it.fails("stops validating on clear", () => {
      const state = dispatch(validating(), `${type}_CLEAR`);

      expect(state.validationFields[field].isValidating).toBe(false);
    });

    it("leaves the other code check alone", () => {
      const other = field === "medicalService" ? "medicalItem" : "medicalService";
      const withOther = { ...initial(), validationFields: { [other]: { isValid: true } } };

      expect(dispatch(withOther, `${type}_REQ`).validationFields[other]).toEqual({ isValid: true });
    });
  });

  describe("mutations", () => {
    const submitting = (type = "MEDICAL_SERVICE_MUTATION_REQ") =>
      dispatch(initial(), type, {
        meta: { clientMutationId: "cmid-1", clientMutationLabel: "Save service" },
      });

    it.each(["MEDICAL_SERVICE_MUTATION_REQ", "MEDICAL_ITEM_MUTATION_REQ"])(
      "records the request metadata while %s is in flight",
      (type) => {
        expect(submitting(type)).toMatchObject({
          submittingMutation: true,
          mutation: { id: "cmid-1", clientMutationLabel: "Save service" },
        });
      },
    );

    it.each([
      ["MEDICAL_SERVICE_CREATE_RESP", "createService"],
      ["MEDICAL_SERVICE_UPDATE_RESP", "updateService"],
      ["MEDICAL_ITEM_CREATE_RESP", "createItem"],
      ["MEDICAL_ITEM_UPDATE_RESP", "updateItem"],
    ])("clears the in-flight flag and keeps the internal id of %s", (type, service) => {
      const state = dispatch(submitting(), type, { payload: { data: { [service]: { internalId: "internal-1" } } } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation.id).toBe("internal-1");
    });

    // Currently fails: deleteMedicalService and deleteMedicalItem dispatch a *_DELETE_RESP
    // success type that no reducer case handles, so submittingMutation stays true and the
    // searcher never journalizes the deletion.
    it.fails.each([
      ["MEDICAL_SERVICE_MUTATION_REQ", "MEDICAL_SERVICE_DELETE_RESP", "deleteService"],
      ["MEDICAL_ITEM_MUTATION_REQ", "MEDICAL_ITEM_DELETE_RESP", "deleteItem"],
    ])("stops submitting once %s is answered by %s", (reqType, type, service) => {
      const state = dispatch(submitting(reqType), type, { payload: { data: { [service]: { internalId: null } } } });

      expect(state.submittingMutation).toBe(false);
    });

    it.each(["MEDICAL_SERVICE_MUTATION_ERR", "MEDICAL_ITEM_MUTATION_ERR"])("raises an alert when %s", (type) => {
      const state = dispatch(submitting(), type, { payload: { status: 500, statusText: "Internal Server Error" } });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: "Internal Server Error" });
    });

    // Currently fails: fe-core's dispatchMutationErr only sets an alert and never clears
    // submittingMutation, so after a failed save the form still believes it is submitting.
    it.fails("stops submitting once a mutation has failed", () => {
      const state = dispatch(submitting(), "MEDICAL_SERVICE_MUTATION_ERR", {
        payload: { status: 500, statusText: "Internal Server Error" },
      });

      expect(state.submittingMutation).toBe(false);
    });
  });
});
