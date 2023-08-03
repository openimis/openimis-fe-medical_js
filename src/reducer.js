import {
  parseData,
  formatServerError,
  formatGraphQLError,
  pageInfo,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
} from "@openimis/fe-core";

function reducer(
  state = {
    fetchingMedicalServices: false,
    fetchingMedicalServicesSummaries: false,
    fetchingMedicalService: false,
    fetchedMedicalServices: null,
    fetchedMedicalServicesSummaries: null,
    fetchedMedicalService: false,
    errorMedicalServices: null,
    errorMedicalServicesSummaries: null,
    errorMedicalService: null,
    medicalServices: null,
    medicalServicesSummaries: null,
    medicalService: null,
    medicalServicesPageInfo: { totalCount: 0 },

    fetchingMedicalItems: false,
    fetchingMedicalItemsSummaries: false,
    fetchingMedicalItem: false,
    fetchedMedicalItems: null,
    fetchedMedicalItemsSummaries: null,
    fetchedMedicalItem: false,
    errorMedicalItems: null,
    errorMedicalItemsSummaries: null,
    errorMedicalItem: null,
    medicalItems: null,
    medicalItemsSummaries: null,
    medicalItem: null,
    medicalItemsPageInfo: { totalCount: 0 },
    submittingMutation: false,
    mutation: {},
  },
  action,
) {
  switch (action.type) {
    case "MEDICAL_SERVICES_REQ":
      return {
        ...state,
        fetchingMedicalServices: true,
        fetchedMedicalServices: null,
        medicalServices: null,
        errorMedicalServices: null,
      };
    case "MEDICAL_SERVICES_RESP":
      return {
        ...state,
        fetchingMedicalServices: false,
        fetchedMedicalServices: action.meta,
        medicalServices: parseData(action.payload.data.medicalServices).map((medicalServices) => ({
          ...medicalServices,
          medicalServicesTypes: getMedicalServicesTypes(medicalServices),
        })),
        errorMedicalServices: formatGraphQLError(action.payload),
      };
    case "MEDICAL_SERVICES_ERR":
      return {
        ...state,
        fetchingMedicalServices: null,
        errorMedicalServices: formatServerError(action.payload),
      };
    case "MEDICAL_SERVICES_SUMMARIES_REQ":
      return {
        ...state,
        fetchingMedicalServicesSummaries: true,
        fetchedMedicalServicesSummaries: null,
        medicalServicesSummaries: null,
      };
    case "MEDICAL_SERVICES_SUMMARIES_RESP":
      return {
        ...state,
        fetchingMedicalServicesSummaries: false,
        fetchedMedicalServicesSummaries: action.meta,
        medicalServicesSummaries: parseData(action.payload.data.medicalServices),
        medicalServicesPageInfo: pageInfo(action.payload.data.medicalServices),
        errorMedicalServicesSummaries: formatGraphQLError(action.payload),
      };
    case "MEDICAL_SERVICES_SUMMARIES_ERR":
      return {
        ...state,
        fetchingMedicalServicesSummaries: null,
        errorMedicalServicesSummaries: formatServerError(action.payload),
      };
    case "MEDICAL_SERVICE_OVERVIEW_REQ":
      return {
        ...state,
        fetchingMedicalService: true,
        fetchedMedicalService: false,
        contribution: null,
        errorMedicalService: null,
      };
    case "MEDICAL_SERVICE_OVERVIEW_RESP":
      const services = parseData(action.payload.data.medicalServices);
      return {
        ...state,
        fetchingMedicalService: false,
        fetchedMedicalService: true,
        medicalService: !!services && services.length > 0 ? services[0] : null,
        errorMedicalService: formatGraphQLError(action.payload),
      };
    case "MEDICAL_SERVICE_OVERVIEW_ERR":
      return {
        ...state,
        fetchedMedicalService: false,
        errorMedicalService: formatServerError(action.payload),
      };
    case "MEDICAL_SERVICE_LIST_REQ":
      return {
        ...state,
        fetchingMedicalServices: true,
        fetchedMedicalServices: false,
        errorMedicalServices: null,
      };
    case "MEDICAL_SERVICE_LIST_RESP":
      const servicesL = parseData(action.payload.data.medicalServices);
      return {
        ...state,
        fetchingMedicalServices: false,
        fetchedMedicalServices: true,
        medicalServices: !!servicesL && servicesL.length > 0 ? servicesL : null,
        errorMedicalServices: formatGraphQLError(action.payload),
      };
    case "MEDICAL_SERVICE_LIST_ERR":
      return {
        ...state,
        fetchedMedicalServices: false,
        errorMedicalServices: formatServerError(action.payload),
      };
    case "MEDICAL_ITEMS_REQ":
      return {
        ...state,
        fetchingMedicalItems: true,
        fetchedMedicalItems: null,
        medicalItems: null,
        errorMedicalItems: null,
      };
    case "MEDICAL_ITEMS_RESP":
      return {
        ...state,
        fetchingMedicalItems: false,
        fetchedMedicalItems: action.meta,
        medicalItems: parseData(action.payload.data.medicalItems).map((medicalItems) => ({
          ...medicalItems,
          //medicalItemsTypes: getMedicalItemsTypes(medicalItems),
        })),
        errorMedicalItems: formatGraphQLError(action.payload),
      };
    case "MEDICAL_ITEMS_ERR":
      return {
        ...state,
        fetchingMedicalItems: null,
        errorMedicalItems: formatServerError(action.payload),
      };
    case "MEDICAL_ITEMS_SUMMARIES_REQ":
      return {
        ...state,
        fetchingMedicalItemsSummaries: true,
        fetchedMedicalItemsSummaries: null,
        medicalItemsSummaries: null,
      };
    case "MEDICAL_ITEMS_SUMMARIES_RESP":
      return {
        ...state,
        fetchingMedicalItemsSummaries: false,
        fetchedMedicalItemsSummaries: action.meta,
        medicalItemsSummaries: parseData(action.payload.data.medicalItems),
        medicalItemsPageInfo: pageInfo(action.payload.data.medicalItems),
        errorMedicalItemsSummaries: formatGraphQLError(action.payload),
      };
    case "MEDICAL_ITEMS_SUMMARIES_ERR":
      return {
        ...state,
        fetchingMedicalItemsSummaries: null,
        errorMedicalItemsSummaries: formatServerError(action.payload),
      };
    case "MEDICAL_ITEM_OVERVIEW_REQ":
      return {
        ...state,
        fetchingMedicalItem: true,
        fetchedMedicalItem: false,
        contribution: null,
        errorMedicalItem: null,
      };
    case "MEDICAL_ITEM_OVERVIEW_RESP":
      const items = parseData(action.payload.data.medicalItems);
      return {
        ...state,
        fetchingMedicalItem: false,
        fetchedMedicalItem: true,
        medicalItem: !!items && items.length > 0 ? items[0] : null,
        errorMedicalItem: formatGraphQLError(action.payload),
      };
    case "MEDICAL_ITEM_OVERVIEW_ERR":
      return {
        ...state,
        fetchedMedicalItem: false,
        errorMedicalItem: formatServerError(action.payload),
      };
    case "SERVICES_FIELDS_VALIDATION_REQ":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalService: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "SERVICES_FIELDS_VALIDATION_RESP":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalService: {
            isValidating: false,
            isValid: action.payload?.data.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case "SERVICES_FIELDS_VALIDATION_ERR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalService: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case "SERVICES_FIELDS_VALIDATION_CLEAR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalService: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "SERVICES_FIELDS_VALIDATION_SET_VALID":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalService: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case "ITEMS_FIELDS_VALIDATION_REQ":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalItem: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "ITEMS_FIELDS_VALIDATION_RESP":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalItem: {
            isValidating: false,
            isValid: action.payload?.data.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case "ITEMS_FIELDS_VALIDATION_ERR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalItem: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case "ITEMS_FIELDS_VALIDATION_CLEAR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalItem: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "ITEMS_FIELDS_VALIDATION_SET_VALID":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          medicalItem: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case "CLEAR_SERVICE_FORM":
      return {
        ...state,
        medicalService: null,
      };
    case "CLEAR_ITEM_FORM":
      return {
        ...state,
        medicalItem: null,
      };
    case "MEDICAL_ITEM_MUTATION_REQ":
      return dispatchMutationReq(state, action);
    case "MEDICAL_ITEM_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "MEDICAL_SERVICE_MUTATION_REQ":
      return dispatchMutationReq(state, action);
    case "MEDICAL_SERVICE_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "MEDICAL_ITEM_CREATE_RESP":
      return dispatchMutationResp(state, "createItem", action);
    case "MEDICAL_ITEM_UPDATE_RESP":
      return dispatchMutationResp(state, "updateItem", action);
    case "MEDICAL_SERVICE_CREATE_RESP":
      return dispatchMutationResp(state, "createService", action);
    case "MEDICAL_SERVICE_UPDATE_RESP":
      return dispatchMutationResp(state, "updateService", action);
    default:
      return state;
  }
}

export default reducer;
