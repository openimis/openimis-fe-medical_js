import { graphql } from "@openimis/fe-core";

export function fetchItems(qry) {
  let payload = `
      {
        medicalItems${!!qry ? `(qry:"${qry}")`: ""}
        {
          code, name
        }
      }
    `
  return graphql(payload, 'MEDICAL_ITEMS');
}

export function fetchServices(qry) {
  let payload = `
        {
          medicalServices${!!qry ? `(qry:"${qry}")`: ""}
          {
            code, name
          }
        }
      `
  return graphql(payload, 'MEDICAL_SERVICES');
}