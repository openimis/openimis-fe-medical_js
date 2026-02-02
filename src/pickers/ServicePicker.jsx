import React, { useState, useMemo } from "react";
import { Autocomplete, toISODate, useGraphqlQuery, useTranslations } from "@openimis/fe-core";

const ServicePicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel,
    withPlaceholder,
    value,
    label,
    filterOptions,
    pricelistUuid,
    date,
    filterSelectedOptions,
    placeholder,
    extraFragment,
    multiple,
    claimProgram
  } = props;
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("medical");

  const { isLoading, data, error } = useGraphqlQuery(
    `query ($searchString: String, $pricelistUuid: UUID, $date: Date) {
      medicalServicesStr(str: $searchString, first: 20, pricelistUuid: $pricelistUuid, date: $date) {
        edges {
          node {
            id name code price packagetype maximumAmount manualPrice
            ${extraFragment ?? ""}
            program {
              idProgram 
              nameProgram
            }
            serviceserviceSet{
              service{
                id
                code
                name
              }
              priceAsked
              qtyProvided
              scpDate
            }
            servicesLinked{
              item{
                id
                code
                name
              }
              priceAsked
              qtyProvided
              pcpDate
            }
          }
        }
      }
    }`,
    { pricelistUuid, searchString, date: toISODate(date) },
    { skip: !pricelistUuid },
  );

  const options = useMemo(() => {
    const services = data?.medicalServicesStr?.edges.map((edge) => edge.node) ?? [];
    
    if (!claimProgram) {
      const uniqueServices = new Map();
      services.forEach(service => {
        if (!uniqueServices.has(service.code)) {
          uniqueServices.set(service.code, service);
        }
      });
      return Array.from(uniqueServices.values());
    }

    const filteredServices = new Map();
    services.forEach(service => {
      if (service?.program?.idProgram === claimProgram) {
        if (!filteredServices.has(service.code)) {
          filteredServices.set(service.code, service);
        }
      }
    });
    
    return Array.from(filteredServices.values());
  }, [data, claimProgram]);

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("ServicePicker.placeholder")}
      label={label ?? formatMessage("ServicePicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={options}
      isLoading={isLoading}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name}`}
      onChange={onChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default ServicePicker;
