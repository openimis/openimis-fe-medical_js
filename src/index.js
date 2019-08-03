import messages_en from "./translations/en.json";
import reducer from "./reducer";
import ItemSimpleSearcher from "./components/ItemSimpleSearcher";
import ServiceSimpleSearcher from "./components/ServiceSimpleSearcher";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'medical', reducer: reducer }],
  "components": [
    {key: "medical.ItemSimpleSearcher", component: ItemSimpleSearcher },
    {key: "medical.ServiceSimpleSearcher", component: ServiceSimpleSearcher },
  ],    
}

// OTHER MODULE PARAMETERS:
// - cacheItems
// - cacheServices

export const MedicalModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
