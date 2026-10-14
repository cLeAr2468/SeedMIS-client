import * as React from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { getProvinces, getMunicipalities, getBarangays } from "@/lib/philippineAddresses";
import { getAllRegions, getProvincesForRegion } from "@/lib/regionProvinceMapping";

export const AddressSelector = ({ 
  values = { region: "", province: "", municipality: "", barangay: "" },
  onChange,
  errors = {},
  disabled = false 
}) => {
  const [regions] = React.useState(getAllRegions());
  const [provinces, setProvinces] = React.useState([]);
  const [municipalities, setMunicipalities] = React.useState([]);
  const [barangays, setBarangays] = React.useState([]);
  const [isInitialMount, setIsInitialMount] = React.useState(true);

  // Update provinces when region changes
  React.useEffect(() => {
    if (values.region) {
      const provs = getProvincesForRegion(values.region);
      setProvinces(provs);
      
      // Only reset dependent fields if NOT initial mount and current province is not in new list
      if (!isInitialMount && values.province && !provs.includes(values.province)) {
        onChange({ 
          region: values.region,
          province: "", 
          municipality: "", 
          barangay: "" 
        });
      }
    } else {
      setProvinces([]);
      setMunicipalities([]);
      setBarangays([]);
    }
    
    // After first render, set isInitialMount to false
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [values.region]);

  // Update municipalities when province changes
  React.useEffect(() => {
    if (values.province) {
      const munis = getMunicipalities(values.province);
      setMunicipalities(munis);
      
      // Only reset if NOT initial mount and current municipality is not in new list
      if (!isInitialMount && values.municipality && !munis.includes(values.municipality)) {
        onChange({ 
          ...values,
          municipality: "", 
          barangay: "" 
        });
      }
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [values.province]);

  // Update barangays when municipality changes
  React.useEffect(() => {
    if (values.province && values.municipality) {
      const brgys = getBarangays(values.province, values.municipality);
      setBarangays(brgys);
      
      // Only reset if NOT initial mount and current barangay is not in new list
      if (!isInitialMount && values.barangay && !brgys.includes(values.barangay)) {
        onChange({ 
          ...values, 
          barangay: "" 
        });
      }
    } else {
      setBarangays([]);
    }
  }, [values.province, values.municipality]);

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    onChange({ 
      region: newRegion,
      province: "", 
      municipality: "", 
      barangay: "" 
    });
  };

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value;
    onChange({ 
      ...values,
      province: newProvince, 
      municipality: "", 
      barangay: "" 
    });
  };

  const handleMunicipalityChange = (e) => {
    const newMunicipality = e.target.value;
    onChange({ 
      ...values, 
      municipality: newMunicipality, 
      barangay: "" 
    });
  };

  const handleBarangayChange = (e) => {
    const newBarangay = e.target.value;
    onChange({ 
      ...values, 
      barangay: newBarangay 
    });
  };

  return (
    <div className="space-y-4">
      {/* Region */}
      <Field>
        <FieldLabel htmlFor="region">Region</FieldLabel>
        <select
          id="region"
          value={values.region}
          onChange={handleRegionChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.region && (
          <p className="text-red-500 text-sm mt-1">{errors.region}</p>
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Province */}
        <Field>
          <FieldLabel htmlFor="province">Province</FieldLabel>
          <select
            id="province"
            value={values.province}
            onChange={handleProvinceChange}
            disabled={disabled || !values.region}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="text-red-500 text-sm mt-1">{errors.province}</p>
          )}
        </Field>

        {/* Municipality */}
        <Field>
          <FieldLabel htmlFor="municipality">Municipality</FieldLabel>
          <select
            id="municipality"
            value={values.municipality}
            onChange={handleMunicipalityChange}
            disabled={disabled || !values.province}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Select Municipality</option>
            {municipalities.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
          {errors.municipality && (
            <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>
          )}
        </Field>

        {/* Barangay */}
        <Field>
          <FieldLabel htmlFor="barangay">Barangay</FieldLabel>
          <select
            id="barangay"
            value={values.barangay}
            onChange={handleBarangayChange}
            disabled={disabled || !values.municipality}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Select Barangay</option>
            {barangays.map((barangay) => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </select>
          {errors.barangay && (
            <p className="text-red-500 text-sm mt-1">{errors.barangay}</p>
          )}
        </Field>
      </div>
    </div>
  );
};
