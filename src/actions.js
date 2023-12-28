import { formatGQLString, formatMutation, formatPageQuery, formatPageQueryWithCount, graphql, graphqlWithVariables } from "@openimis/fe-core";
import _ from "lodash";

const MEDICAL_SERVICES_SUMMARY_PROJECTION = [
  "uuid",
  "code",
  "name",
  "type",
  "price",
  "maximumAmount",
  "validityFrom",
  "validityTo",
  "level",
];
const MEDICAL_ITEMS_SUMMARY_PROJECTION = [
  "uuid",
  "code",
  "name",
  "type",
  "quantity",
  "maximumAmount",
  "price",
  "validityFrom",
  "validityTo",
  "package",
];

const MEDICAL_SERVICE_FULL_PROJECTION = (mm) => [
  "uuid",
  "code",
  "name",
  "type",
  "price",
  "maximumAmount",
  "careType",
  "uuid",
  "frequency",
  "patientCategory",
  "validityFrom",
  "validityTo",
  "level",
  "category",
];

const MEDICAL_ITEM_FULL_PROJECTION = (mm) => [
  "uuid",
  "code",
  "name",
  "type",
  "quantity",
  "maximumAmount",
  "price",
  "careType",
  "uuid",
  "frequency",
  "patientCategory",
  "validityFrom",
  "validityTo",
  "package",
];

export function formatMedicalItemOrServiceGQL(mm, ms) {
  const req = `
    ${ms.uuid ? `uuid: "${ms.uuid}"` : ""}
    ${ms.code ? `code: "${ms.code}"` : ""}
    ${ms.name ? `name: "${formatGQLString(ms.name)}"` : ""}
    ${ms.type ? `type: "${formatGQLString(ms.type)}"` : ""}
    ${ms.price ? `price: "${ms.price}"` : ""}
    ${ms.quantity ? `quantity: "${ms.quantity}"` : ""}
    ${ms.maximumAmount ? `maximumAmount: "${ms.maximumAmount}"` : ""}
    ${ms.careType ? `careType: "${formatGQLString(ms.careType)}"` : ""}
    ${ms.frequency ? `frequency: "${ms.frequency}"` : ""}
    ${`patientCategory: ${ms.patientCategory}`}
    ${ms.category && ms.category !== " " ? `category: "${formatGQLString(ms.category)}"` : ""}
    ${ms.level ? `level: "${formatGQLString(ms.level)}"` : ""}
    ${ms.package ? `package: "${formatGQLString(ms.package)}"` : ""}
  `;
  return req;
}

export function fetchMedicalItems(mm, hf, str, prev) {
  const filters = [];
  if (str) {
    filters.push(`str: "${str}"`);
  }
  if (_.isEqual(filters, prev)) {
    return (dispatch) => {};
  }
  const payload = formatPageQuery("medicalItems", filters, mm.getRef("medical.MedicalItemsPicker.projection"));
  return graphql(payload, "MEDICAL_ITEMS", filters);
}

export function fetchMedicalServicesSummaries(mm, filters) {
  const payload = formatPageQueryWithCount("medicalServices", filters, MEDICAL_SERVICES_SUMMARY_PROJECTION);
  return graphql(payload, "MEDICAL_SERVICES_SUMMARIES");
}

export function fetchMedicalItemsSummaries(mm, filters) {
  const payload = formatPageQueryWithCount("medicalItems", filters, MEDICAL_ITEMS_SUMMARY_PROJECTION);
  return graphql(payload, "MEDICAL_ITEMS_SUMMARIES");
}

export function createMedicalService(mm, medicalService, clientMutationLabel) {
  const mutation = formatMutation(
    "createService",
    formatMedicalItemOrServiceGQL(mm, medicalService),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["MEDICAL_SERVICE_MUTATION_REQ", "MEDICAL_SERVICE_CREATE_RESP", "MEDICAL_SERVICE_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createMedicalItem(mm, medicalItem, clientMutationLabel) {
  let mutation = formatMutation("createItem", formatMedicalItemOrServiceGQL(mm, medicalItem), clientMutationLabel);
  let requestedDateTime = new Date();
  return graphql(
    mutation.payload, ["MEDICAL_ITEM_MUTATION_REQ", "MEDICAL_ITEM_CREATE_RESP", "MEDICAL_ITEM_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateMedicalService(mm, medicalService, clientMutationLabel) {
  const mutation = formatMutation(
    "updateService",
    formatMedicalItemOrServiceGQL(mm, medicalService),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["MEDICAL_SERVICE_MUTATION_REQ", "MEDICAL_SERVICE_UPDATE_RESP", "MEDICAL_SERVICE_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateMedicalItem(mm, medicalItem, clientMutationLabel) {
  const mutation = formatMutation("updateItem", formatMedicalItemOrServiceGQL(mm, medicalItem), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["MEDICAL_ITEM_MUTATION_REQ", "MEDICAL_ITEM_UPDATE_RESP", "MEDICAL_ITEM_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteMedicalService(mm, medicalService, clientMutationLabel) {
  const mutation = formatMutation("deleteService", `uuids: ["${medicalService.uuid}"]`, clientMutationLabel);
  // eslint-disable-next-line no-param-reassign
  medicalService.clientMutationId = mutation.clientMutationId;
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["MEDICAL_SERVICE_MUTATION_REQ", "MEDICAL_SERVICE_DELETE_RESP", "MEDICAL_SERVICE_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteMedicalItem(mm, medicalItem, clientMutationLabel) {
  const mutation = formatMutation("deleteItem", `uuids: ["${medicalItem.uuid}"]`, clientMutationLabel);
  // eslint-disable-next-line no-param-reassign
  medicalItem.clientMutationId = mutation.clientMutationId;
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["MEDICAL_ITEM_MUTATION_REQ", "MEDICAL_ITEM_DELETE_RESP", "MEDICAL_ITEM_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function fetchMedicalService(mm, medicalServiceId, clientMutationId) {
  const filters = [];
  if (medicalServiceId) {
    filters.push(`uuid: "${formatGQLString(medicalServiceId)}", showHistory: true`);
  } else if (clientMutationId) {
    filters.push(`clientMutationId: "${formatGQLString(clientMutationId)}"`);
  }
  const payload = formatPageQuery("medicalServices", filters, MEDICAL_SERVICE_FULL_PROJECTION(mm));
  return graphql(payload, "MEDICAL_SERVICE_OVERVIEW");
}

export function fetchMedicalItem(mm, medicalItemId, clientMutationId) {
  const filters = [];
  if (medicalItemId) {
    filters.push(`uuid: "${formatGQLString(medicalItemId)}", showHistory: true`);
  } else if (clientMutationId) {
    filters.push(`clientMutationId: "${formatGQLString(clientMutationId)}"`);
  }
  const payload = formatPageQuery("medicalItems", filters, MEDICAL_ITEM_FULL_PROJECTION(mm));
  return graphql(payload, "MEDICAL_ITEM_OVERVIEW");
}

export function newMedicalService() {
  return (dispatch) => {
    dispatch({ type: "MEDICAL_SERVICE_NEW" });
  };
}

export function newMedicalItem() {
  return (dispatch) => {
    dispatch({ type: "MEDICAL_ITEM_NEW" });
  };
}

export function fetchMedicalServiceMutation(mm, clientMutationId) {
  const payload = formatPageQuery(
    "medicalServices",
    [`clientMutationId:"${clientMutationId}"`],
    ["uuid"],
  );
  return graphql(payload, "MEDICAL_SERVICE");
}

export function fetchMedicalItemMutation(mm, clientMutationId) {
  const payload = formatPageQuery(
    "medicalItems",
    [`clientMutationId:"${clientMutationId}"`],
    ["uuid"],
  );
  return graphql(payload, "MEDICAL_ITEM");
}

export function medicalServicesValidationCheck(mm, variables) {
  return graphqlWithVariables(
    `
    query ($serviceCode: String!) {
      isValid: validateServiceCode(serviceCode: $serviceCode)
    }
    `,
    variables,
    `SERVICES_FIELDS_VALIDATION`,
  );
}

export function medicalServicesSetValid() {
  return (dispatch) => {
    dispatch({ type: `SERVICES_FIELDS_VALIDATION_SET_VALID` });
  };
}

export function medicalServicesValidationClear() {
  return (dispatch) => {
    dispatch({ type: `SERVICES_FIELDS_VALIDATION_CLEAR` });
  };
}

export function medicalItemsValidationCheck(mm, variables) {
  return graphqlWithVariables(
    `
    query ($itemCode: String!) {
      isValid: validateItemCode(itemCode: $itemCode)
    }
    `,
    variables,
    `ITEMS_FIELDS_VALIDATION`,
  );
}

export function medicalItemsSetValid() {
  return (dispatch) => {
    dispatch({ type: `ITEMS_FIELDS_VALIDATION_SET_VALID` });
  };
}

export function medicalItemsValidationClear() {
  return (dispatch) => {
    dispatch({ type: `ITEMS_FIELDS_VALIDATION_CLEAR` });
  };
}

export function clearServiceForm() {
  return (dispatch) => {
    dispatch({ type: "CLEAR_SERVICE_FORM" });
  };
}

export function clearItemForm() {
  return (dispatch) => {
    dispatch({ type: "CLEAR_ITEM_FORM" });
  };
}