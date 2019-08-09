import { graphql, formatPageQuery } from "@openimis/fe-core";

export function fetchItems(qry) {
  let payload = formatPageQuery("medicalItems",
    !!qry && [`qry:"${qry}"`],
    ["code", "name"]
  );
  return graphql(payload, 'MEDICAL_ITEMS');
}

export function fetchServices(qry) {
  let payload = formatPageQuery("medicalServices",
    !!qry && [`qry:"${qry}"`],
    ["code", "name"]
  );
  return graphql(payload, 'MEDICAL_SERVICES');
}