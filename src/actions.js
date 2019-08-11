import { graphql, formatPageQuery } from "@openimis/fe-core";

export function fetchDiagnoses(str) {
  let payload = formatPageQuery("diagnosesStr",
    !!str && str.length && [`str:"${str}"`],
    ["id", "code", "name"]
  );
  return graphql(payload, 'MEDICAL_DIAGNOSES');
}

export function fetchItems(str) {
  let payload = formatPageQuery("medicalItemsStr",
    !!str && str.length && [`str:"${str}"`],
    ["id", "code", "name"]
  );
  return graphql(payload, 'MEDICAL_ITEMS');
}

export function fetchServices(str) {
  let payload = formatPageQuery("medicalServicesStr",
    !!str && str.length && [`str:"${str}"`],
    ["id", "code", "name"]
  );
  return graphql(payload, 'MEDICAL_SERVICES');
}