import messages_en from "./translations/en.json";
import reducer from "./reducer";
import ItemSelect from "./components/ItemSelect";
import ServiceSelect from "./components/ServiceSelect";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'medical', reducer }],
  "components": [
    {key: "medical.ItemSelect", component: ItemSelect },
    {key: "medical.ServiceSelect", component: ServiceSelect },
  ],    
}

// OTHER MODULE PARAMETERS:
// - cacheItems
// - cacheServices

export const MedicalModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
