import { parseData, formatServerError, formatGraphQLError, pageInfo } from "@openimis/fe-core";

function reducer(
  state = {
    fetchingDiagnosis: false,
    fetchedDiagnosis: false,
    errorDiagnosis: null,
    diagnoses: null,

    fetchingItems: false,
    fetchedItems: false,
    errorItems: null,
    items: null,

    fetchingServices: false,
    fetchedServices: false,
    errorServices: null,
    services: null,

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
  },
  action,
) {
  switch (action.type) {
    case "MEDICAL_DIAGNOSIS_PICKER_REQ":
      return {
        ...state,
        fetchingDiagnosis: true,
        fetchedDiagnosis: false,
        diagnoses: null,
        errorDiagnosis: null,
      };
    case "MEDICAL_DIAGNOSIS_PICKER_RESP":
      return {
        ...state,
        fetchingDiagnosis: false,
        fetchedDiagnosis: true,
        diagnoses: parseData(action.payload.data.diagnosesStr),
        errorDiagnosis: formatGraphQLError(action.payload),
      };
    case "MEDICAL_DIAGNOSIS_PICKER_ERR":
      return {
        ...state,
        fetchingDiagnosis: false,
        errorDiagnosis: formatServerError(action.payload),
      };
    case "MEDICAL_ITEM_PICKER_REQ":
      return {
        ...state,
        fetchingItems: true,
        fetchedItems: false,
        items: null,
        errorItems: null,
      };
    case "MEDICAL_ITEM_PICKER_RESP":
      return {
        ...state,
        fetchingItems: false,
        fetchedItems: true,
        items: parseData(action.payload.data.medicalItemsStr),
        errorItems: formatGraphQLError(action.payload),
      };
    case "MEDICAL_ITEM_PICKER_ERR":
      return {
        ...state,
        fetchingItems: false,
        errorItems: formatServerError(action.payload),
      };
    case "MEDICAL_SERVICE_PICKER_REQ":
      return {
        ...state,
        fetchingServices: true,
        fetchedServices: false,
        services: null,
        errorServices: null,
      };
    case "MEDICAL_SERVICE_PICKER_RESP":
      return {
        ...state,
        fetchingServices: false,
        fetchedServices: true,
        services: parseData(action.payload.data.medicalServicesStr),
        errorServices: formatGraphQLError(action.payload),
      };
    case "MEDICAL_SERVICE_PICKER_ERR":
      return {
        ...state,
        fetchingServices: false,
        errorServices: formatServerError(action.payload),
      };

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
          //medicalServicesTypes: getMedicalServicesTypes(medicalServices),
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
        errorUsersSummaries: null,
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
        errorUsersSummaries: null,
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
    default:
      return state;
  }
}

export default reducer;
