import messages_en from "./translations/en.json";
import reducer from "./reducer";
import DiagnosisPicker from "./components/DiagnosisPicker";
import ItemPicker from "./components/ItemPicker";
import ServicePicker from "./components/ServicePicker";
import VisitTypePicker from "./components/VisitTypePicker";

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
  ],
  // OTHER MODULE PARAMETERS:
  // cacheItems
  // cacheServices  
}


export const MedicalModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
