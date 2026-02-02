import React, { useState, useMemo } from "react";
import { Autocomplete, toISODate, useGraphqlQuery, useTranslations } from "@openimis/fe-core";

const ItemPicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
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
    `query ($searchString: String, $first: Int, $pricelistUuid: UUID, $date: Date) {
      medicalItemsStr(str: $searchString, first: $first, pricelistUuid: $pricelistUuid, date: $date) {
        edges {
          node {
            id name code price quantity maximumAmount
            ${extraFragment ?? ""}
            program {
              idProgram 
              nameProgram
            }
          }
        }
      }
    }`,
    { pricelistUuid, searchString, first: 20, date: toISODate(date) },
    { skip: !pricelistUuid },
  );

  const options = useMemo(() => {
    const items = data?.medicalItemsStr?.edges.map((edge) => edge.node) ?? [];
    
    if (!claimProgram) {
      const uniqueItems = new Map();
      items.forEach(item => {
        if (!uniqueItems.has(item.code)) {
          uniqueItems.set(item.code, item);
        }
      });
      return Array.from(uniqueItems.values());
    }

    const filteredItems = new Map();
    items.forEach(item => {
      if (item?.program?.idProgram === claimProgram) {
        if (!filteredItems.has(item.code)) {
          filteredItems.set(item.code, item);
        }
      }
    });
    
    return Array.from(filteredItems.values());
  }, [data, claimProgram]);

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("ItemPicker.placeholder")}
      label={label ?? formatMessage("ItemPicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={options}
      getOptionSelected={(option, value) => option.id === value?.id}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name} ${option.quantity ? ` (${option.quantity})` : ""}`}
      onChange={onChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default ItemPicker;
