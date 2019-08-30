import messages_en from "./translations/en.json";
import reducer from "./reducer";
import DiagnosisPicker from "./pickers/DiagnosisPicker";
import ItemPicker from "./pickers/ItemPicker";
import ServicePicker from "./pickers/ServicePicker";
import VisitTypePicker from "./pickers/VisitTypePicker";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'medical', reducer }],
  "refs": [
    { key: "medical.DiagnosisPicker", ref: DiagnosisPicker },
    { key: "medical.DiagnosisPicker.projection", ref: ["id", "code", "name"] },
    { key: "medical.ItemPicker", ref: ItemPicker },
    { key: "medical.ItemPicker.projection", ref: ["id", "code", "name"] },
    { key: "medical.ServicePicker", ref: ServicePicker },
    { key: "medical.ServicePicker.projection", ref: ["id", "code", "name"] },
    { key: "medical.VisitTypePicker", ref: VisitTypePicker },
    { key: "medical.VisitTypePicker.projection", ref: null },
    { key: "medical.CareTypePicker", ref: VisitTypePicker },
    { key: "medical.CareTypePicker.projection", ref: null },
  ],
  // OTHER MODULE PARAMETERS:
  // cacheItems
  // cacheServices  
}


export const MedicalModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
