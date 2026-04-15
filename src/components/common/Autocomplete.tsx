import { Autocomplete as MuiAutocomplete, createFilterOptions, TextField } from "@mui/material";
import { useState } from "react";

export interface Option {
  id: string | number
  name: string
}

type CreateOption = Option & { __isCreateOption: true; inputValue: string }

interface AutocompleteProps {
  sx?: object
  id: string
  label: string
  required?: boolean
  value: Option | null
  defaultValue?: Option
  options: Option[]
  onChange: (_event: React.SyntheticEvent, newValue: Option | null) => void
  onCreate?: (inputValue: string) => void
  noOptionsText?: string
  creatable?: boolean
  createText?: (input: string) => string
}

const filter = createFilterOptions<Option | CreateOption>();

const Autocomplete = ({
  sx,
  id,
  label,
  required,
  value,
  defaultValue,
  options,
  onChange,
  onCreate,
  noOptionsText,
  creatable,
  createText
}: AutocompleteProps) => {
  const [inputValue, setInputValue] = useState("")

  return (
    <MuiAutocomplete
      sx={sx}
      id={id}
      options={options}
      value={value}
      isOptionEqualToValue={(o, v) => {
        if (typeof o === "object" && typeof v === "object") return o.id === v.id
        return o === v
      }}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          if (!creatable) return onChange(event, null)
          const input = newValue.trim()
          if (!input) return onChange(event, null)
          const exists = options.find((opt) => opt.name.toLowerCase() === input.toLowerCase())
          if (exists) return onChange(event, exists)

          if (onCreate) {
            onCreate(input)
            setInputValue("")
            return onChange(event, null)
          }

          // Fallback: pass create-option to parent
          return onChange(event, {
            id: "__create__",
            name: createText ? createText(input) : `Lisää "${input}"`,
            inputValue: input,
            __isCreateOption: true,
          } as unknown as Option)
        }

        if ((newValue as unknown as CreateOption | null)?.__isCreateOption) {
          const input = (newValue as unknown as CreateOption).inputValue
          if (onCreate) {
            onCreate(input)
            setInputValue("")
            return onChange(event, null)
          }
        }

        return onChange(event, newValue as Option | null)
      }}
      freeSolo={!!creatable}
      inputValue={inputValue}
      onInputChange={(_e, v) => setInputValue(v)}
      filterSelectedOptions
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params);
        if (!creatable) return filtered;

        const input = params.inputValue.trim();
        if (!input) return filtered;

        const exists = opts.some((opt) => opt.name.toLowerCase() === input.toLowerCase());
        if (exists) return filtered;

        filtered.push({
          id: "__create__",
          name: createText ? createText(input) : `Lisää "${input}"`,
          inputValue: input,
          __isCreateOption: true,
        } as CreateOption);
        return filtered;
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option
        return option.name
      }}
      renderOption={(props, option, state) => {
        const computedKey =
          typeof option === "string"
            ? `str:${option}:${state.index}`
            : (option as unknown as CreateOption).__isCreateOption
              ? `create:${(option as unknown as CreateOption).inputValue}:${state.index}`
              : `opt:${String(option.id)}:${state.index}`

        return (
          <li {...props} key={computedKey}>
            {typeof option === "string" ? option : option.name}
          </li>
        )
      }}
      defaultValue={defaultValue}
      noOptionsText={noOptionsText}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required ? true : false}
          variant="outlined"
          label={label}
        />
      )}
    />
  )
}

export default Autocomplete
