import { graphql, formatPageQuery } from "@openimis/fe-core";

export function fetchDiagnoses(mm, str) {
  let payload = formatPageQuery("diagnosesStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("medical.DiagnosisPicker.projection")
  );
  return graphql(payload, 'MEDICAL_DIAGNOSES');
}

export function fetchItems(mm, str) {
  let payload = formatPageQuery("medicalItemsStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("medical.ItemPicker.projection")
  );
  return graphql(payload, 'MEDICAL_ITEMS');
}

export function fetchServices(mm, str) {
  let payload = formatPageQuery("medicalServicesStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("medical.ServicePicker.projection")
  );
  return graphql(payload, 'MEDICAL_SERVICES');
}