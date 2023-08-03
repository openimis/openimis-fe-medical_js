import React, { useState } from "react";
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
  } = props;
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("medical");

  const { isLoading, data, error } = useGraphqlQuery(
    `query ($searchString: String, $pricelistUuid: UUID, $date: Date) {
      medicalServicesStr(str: $searchString, first: 20, pricelistUuid: $pricelistUuid, date: $date) {
        edges {
          node {
<<<<<<< HEAD
            id name code price packagetype
=======
            id name code price maximumAmount
>>>>>>> ca219aa960aa1d6d8b3f835a3384c232614f4d2b
            ${extraFragment ?? ""}
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
    { skip: true },
  );

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
      options={data?.medicalServicesStr?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      getOptionSelected={(option, value) => option.id === value?.id}
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
