import { graphql, formatPageQuery } from "@openimis/fe-core";

export function fetchDiagnosisPicker(mm, str) {
  let payload = formatPageQuery("diagnosesStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("medical.DiagnosisPicker.projection")
  );
  return graphql(payload, 'MEDICAL_DIAGNOSIS_PICKER');
}

export function fetchItemPicker(mm, str) {
  let payload = formatPageQuery("medicalItemsStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("medical.ItemPicker.projection")
  );
  return graphql(payload, 'MEDICAL_ITEM_PICKER');
}

export function fetchServicePicker(mm, str) {
  let payload = formatPageQuery("medicalServicesStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("medical.ServicePicker.projection")
  );
  return graphql(payload, 'MEDICAL_SERVICE_PICKER');
}