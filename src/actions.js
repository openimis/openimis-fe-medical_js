import { graphql, formatPageQuery, toISODate } from "@openimis/fe-core";

export function fetchDiagnosisPicker(mm, str) {
  let payload = formatPageQuery("diagnosesStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("medical.DiagnosisPicker.projection")
  );
  return graphql(payload, 'MEDICAL_DIAGNOSIS_PICKER');
}

export function fetchItemPicker(mm, str, refDate) {
  let filter = []
  if (!!str && str.length) {
    filter.push(`str:"${str}"`);
  }
  if (!!refDate) {
    filter.push(`date: "${toISODate(refDate)}"`)
  }  
  let payload = formatPageQuery("medicalItemsStr",
    filter,
    mm.getRef("medical.ItemPicker.projection")
  );
  return graphql(payload, 'MEDICAL_ITEM_PICKER');
}

export function fetchServicePicker(mm, str, refDate) {
  let filter = []
  if (!!str && str.length) {
    filter.push(`str:"${str}"`);
  }
  if (!!refDate) {
    filter.push(`date: "${toISODate(refDate)}"`)
  }
  let payload = formatPageQuery("medicalServicesStr",
    filter,
    mm.getRef("medical.ServicePicker.projection")
  );
  return graphql(payload, 'MEDICAL_SERVICE_PICKER');
}