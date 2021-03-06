import { parseData, formatServerError, formatGraphQLError } from '@openimis/fe-core';

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
    },
    action,
) {
    switch (action.type) {
        case 'MEDICAL_DIAGNOSIS_PICKER_REQ':
            return {
                ...state,
                fetchingDiagnosis: true,
                fetchedDiagnosis: false,
                diagnoses: null,
                errorDiagnosis: null,
            };
        case 'MEDICAL_DIAGNOSIS_PICKER_RESP':
            return {
                ...state,
                fetchingDiagnosis: false,
                fetchedDiagnosis: true,
                diagnoses: parseData(action.payload.data.diagnosesStr),
                errorDiagnosis: formatGraphQLError(action.payload)
            };
        case 'MEDICAL_DIAGNOSIS_PICKER_ERR':
            return {
                ...state,
                fetchingDiagnosis: false,
                errorDiagnosis: formatServerError(action.payload)
            };        
        case 'MEDICAL_ITEM_PICKER_REQ':
            return {
                ...state,
                fetchingItems: true,
                fetchedItems: false,
                items: null,
                errorItems: null,
            };
        case 'MEDICAL_ITEM_PICKER_RESP':
            return {
                ...state,
                fetchingItems: false,
                fetchedItems: true,
                items: parseData(action.payload.data.medicalItemsStr),
                errorItems: formatGraphQLError(action.payload)
            };
        case 'MEDICAL_ITEM_PICKER_ERR':
            return {
                ...state,
                fetchingItems: false,
                errorItems: formatServerError(action.payload)
            };
        case 'MEDICAL_SERVICE_PICKER_REQ':
            return {
                ...state,
                fetchingServices: true,
                fetchedServices: false,
                services: null,
                errorServices: null,
            };
        case 'MEDICAL_SERVICE_PICKER_RESP':
            return {
                ...state,
                fetchingServices: false,
                fetchedServices: true,
                services: parseData(action.payload.data.medicalServicesStr),
                errorServices: formatGraphQLError(action.payload)
            };
        case 'MEDICAL_SERVICE_PICKER_ERR':
            return {
                ...state,
                fetchingServices: false,
                errorServices: formatServerError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;
