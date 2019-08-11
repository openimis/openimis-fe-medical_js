import { parseData, formatServerError, formatGraphQLError } from '@openimis/fe-core';

function reducer(
    state = {
        fetchingDiagnoses: false,
        fetchedDiagnoses: false,
        errorDiagnoses: null,
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
        case 'MEDICAL_DIAGNOSES_REQ':
            return {
                ...state,
                fetchingDiagnoses: true,
                fetchedDiagnoses: false,
                diagnoses: null,
                errorDiagnoses: null,
            };
        case 'MEDICAL_DIAGNOSES_RESP':
            return {
                ...state,
                fetchingDiagnoses: false,
                fetchedDiagnoses: true,
                diagnoses: parseData(action.payload.data.diagnosesStr),
                errorDiagnoses: formatGraphQLError(action.payload)
            };
        case 'MEDICAL_DIAGNOSES_ERR':
            return {
                ...state,
                fetchingDiagnoses: false,
                errorDiagnoses: formatServerError(action.payload)
            };        
        case 'MEDICAL_ITEMS_REQ':
            return {
                ...state,
                fetchingItems: true,
                fetchedItems: false,
                items: null,
                errorItems: null,
            };
        case 'MEDICAL_ITEMS_RESP':
            return {
                ...state,
                fetchingItems: false,
                fetchedItems: true,
                items: parseData(action.payload.data.medicalItemsStr),
                errorItems: formatGraphQLError(action.payload)
            };
        case 'MEDICAL_ITEMS_ERR':
            return {
                ...state,
                fetchingItems: false,
                errorItems: formatServerError(action.payload)
            };
        case 'MEDICAL_SERVICES_REQ':
            return {
                ...state,
                fetchingServices: true,
                fetchedServices: false,
                services: null,
                errorServices: null,
            };
        case 'MEDICAL_SERVICES_RESP':
            return {
                ...state,
                fetchingServices: false,
                fetchedServices: true,
                services: parseData(action.payload.data.medicalServicesStr),
                errorServices: formatGraphQLError(action.payload)
            };
        case 'MEDICAL_SERVICES_ERR':
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
