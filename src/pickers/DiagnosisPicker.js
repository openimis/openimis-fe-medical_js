import React, { useState } from "react";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery } from "@openimis/fe-core";
import _debounce from "lodash/debounce";

const DiagnosisPicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    withPlaceholder,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
    multiple,
    extraFragment,
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("medical", modulesManager);
  const [variables, setVariables] = useState({});

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query DiagnosisPicker ($search: String) {
      diagnosesStr(str: $search, first: 20) {
        edges {
          node {
            id
            code
            name
            ${extraFragment ?? ""}
          }
        }
      }
    }
  `,
    variables,
    { skip: true },
  );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("DiagnosisPicker.placeholder")}
      label={label ?? formatMessage("Diagnosis")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.diagnosesStr?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name}`}
      onChange={(v) => onChange(v, v ? `${v.code} ${v.name}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setVariables({ search })}
    />
  );
};

export default DiagnosisPicker;
