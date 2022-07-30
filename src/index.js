import messages_en from "./translations/en.json";
import messages_fr from "./translations/fr.json";
import reducer from "./reducer";
import DiagnosisPicker from "./pickers/DiagnosisPicker";
import ItemPicker from "./pickers/ItemPicker";
import ServicePicker from "./pickers/ServicePicker";
import ServiceFilterWithoutHFPicker from "./pickers/ServiceFilterWithoutHFPicker";
import VisitTypePicker from "./pickers/VisitTypePicker";
import CareTypePicker from "./pickers/CareTypePicker";
import ServiceCategoryPicker from "./pickers/ServiceCategoryPicker";
import ServiceTypePicker from "./pickers/ServiceTypePicker";
import ServiceTypePPPicker from "./pickers/ServiceTypePPPicker";
import ServiceLevelPicker from "./pickers/ServiceLevelPicker";
import ManualPricePicker from "./pickers/ManualPricePicker";
import PatientCategoryPicker from "./pickers/PatientCategoryPicker";
import MedicalServicePage from "./pages/MedicalServicePage";
import MedicalServiceOverviewPage from "./pages/MedicalServiceOverviewPage";
import MedicalServicesPage from "./pages/MedicalServicesPage";
import MedicalItemsPage from "./pages/MedicalItemsPage";
import MedicalItemPage from "./pages/MedicalItemPage";
import MedicalItemOverviewPage from "./pages/MedicalItemOverviewPage";
import ItemTypePicker from "./pickers/ItemTypePicker";

const ROUTE_ADMIN_MEDICAL_SERVICES = "medical/medicalServices";
const ROUTE_ADMIN_MEDICAL_SERVICES_OVERVIEW = "medical/medicalServices/overview";
const ROUTE_ADMIN_MEDICAL_SERVICES_NEW = "medical/medicalServices/new";
const ROUTE_ADMIN_MEDICAL_ITEMS = "medical/medicalItems";
const ROUTE_ADMIN_MEDICAL_ITEMS_OVERVIEW = "medical/medicalItems/overview";
const ROUTE_ADMIN_MEDICAL_ITEMS_NEW = "medical/medicalItems/new";

const DEFAULT_CONFIG = {
  "translations": [
    { key: "en", messages: messages_en },
    { key: "fr", messages: messages_fr },
  ],
  "reducers": [{ key: "medical", reducer }],
  "core.Router": [
    { path: ROUTE_ADMIN_MEDICAL_SERVICES, component: MedicalServicesPage },
    { path: ROUTE_ADMIN_MEDICAL_SERVICES_NEW, component: MedicalServicePage },
    {
      path: `${ROUTE_ADMIN_MEDICAL_SERVICES_OVERVIEW}/:medical_service_id`,
      component: MedicalServiceOverviewPage,
    },
    { path: ROUTE_ADMIN_MEDICAL_ITEMS, component: MedicalItemsPage },
    { path: ROUTE_ADMIN_MEDICAL_ITEMS_NEW, component: MedicalItemPage },
    {
      path: `${ROUTE_ADMIN_MEDICAL_ITEMS_OVERVIEW}/:medical_item_id`,
      component: MedicalItemOverviewPage,
    },
    //    { path: "medical/medicalItems", component: MedicalItemsPage },
  ],
  "refs": [
    { key: "medical.DiagnosisPicker", ref: DiagnosisPicker },
    { key: "medical.DiagnosisPicker.projection", ref: ["id", "code", "name"] },
    { key: "medical.ItemPicker", ref: ItemPicker },
    { key: "medical.ServicePicker", ref: ServicePicker },
    { key: "medical.ServiceFilterWithoutHFPicker", ref: ServiceFilterWithoutHFPicker },
    { key: "medical.VisitTypePicker", ref: VisitTypePicker },
    { key: "medical.VisitTypePicker.projection", ref: null },
    { key: "medical.CareTypePicker", ref: CareTypePicker },
    { key: "medical.CareTypePicker.projection", ref: null },
    { key: "medical.ServiceCategoryPicker", ref: ServiceCategoryPicker },
    { key: "medical.ServiceCategoryPicker.projection", ref: null },
    { key: "medical.ServiceLevelPicker", ref: ServiceLevelPicker },
    { key: "medical.ServiceLevelPicker.projection", ref: null },
    { key: "medical.ServiceTypePicker", ref: ServiceTypePicker },
    { key: "medical.ServiceTypePPPicker", ref: ServiceTypePPPicker },
    { key: "medical.ServiceTypePicker.projection", ref: null },
    { key: "medical.ItemTypePicker", ref: ItemTypePicker },
    { key: "medical.ItemTypePicker.projection", ref: null },
    { key: "medical.ManualPricePicker", ref: ManualPricePicker },
    { key: "medical.ManualPricePicker.projection", ref: null },
    { key: "medical.PatientCategoryPicker", ref: PatientCategoryPicker },
    { key: "medical.PatientCategoryPicker.projection", ref: null },
    { key: "medical.medicalServices", ref: ROUTE_ADMIN_MEDICAL_SERVICES },
    { key: "medical.medicalServiceOverview", ref: ROUTE_ADMIN_MEDICAL_SERVICES_OVERVIEW },
    { key: "medical.medicalServiceNew", ref: ROUTE_ADMIN_MEDICAL_SERVICES_NEW },
    { key: "medical.medicalItems", ref: ROUTE_ADMIN_MEDICAL_ITEMS },
    { key: "medical.medicalItemOverview", ref: ROUTE_ADMIN_MEDICAL_ITEMS_OVERVIEW },
    { key: "medical.medicalItemNew", ref: ROUTE_ADMIN_MEDICAL_ITEMS_NEW },
  ],
};

export const MedicalModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};
