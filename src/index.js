import messages_en from "./translations/en.json";
import reducer from "./reducer";
import DiagnosisSelect from "./components/DiagnosisSelect";
import ItemSelect from "./components/ItemSelect";
import ServiceSelect from "./components/ServiceSelect";
import VisitTypeSelect from "./components/VisitTypeSelect";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'medical', reducer }],
  "refs": [
    {key: "medical.DiagnosisSelect", ref: DiagnosisSelect },
    {key: "medical.ItemSelect", ref: ItemSelect },
    {key: "medical.ServiceSelect", ref: ServiceSelect },
    {key: "medical.VisitTypeSelect", ref: VisitTypeSelect },
  ],    
  "DIAGNOSIS_ID_TYPE": "DiagnosisGQLType",
  "ITEM_ID_TYPE": "ItemGQLType",
  "SERVICE_ID_TYPE": "ServiceGQLType",
  // OTHER MODULE PARAMETERS:
  // cacheItems
  // cacheServices  
}


export const MedicalModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
