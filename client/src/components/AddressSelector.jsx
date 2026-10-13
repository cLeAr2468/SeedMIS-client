import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { getMunicipalities, getBarangays } from '@/lib/philippineAddresses';
import { getAllRegions, getProvincesForRegion } from '@/lib/regionProvinceMapping';

export const AddressSelector = ({ 
  values = { region: '', province: '', municipality: '', barangay: '' },
  onChange,
  errors = {},
  disabled = false 
}) => {
  const [regions] = useState(getAllRegions());
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Update provinces when region changes
  useEffect(() => {
    if (values.region) {
      const provs = getProvincesForRegion(values.region);
      setProvinces(provs);
      
      // Only reset dependent fields if NOT initial mount and current province is not in new list
      if (!isInitialMount && values.province && !provs.includes(values.province)) {
        onChange({ 
          region: values.region,
          province: '', 
          municipality: '', 
          barangay: '' 
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
  useEffect(() => {
    if (values.province) {
      const munis = getMunicipalities(values.province);
      setMunicipalities(munis);
      
      // Only reset if NOT initial mount and current municipality is not in new list
      if (!isInitialMount && values.municipality && !munis.includes(values.municipality)) {
        onChange({ 
          ...values,
          municipality: '', 
          barangay: '' 
        });
      }
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [values.province]);

  // Update barangays when municipality changes
  useEffect(() => {
    if (values.province && values.municipality) {
      const brgys = getBarangays(values.province, values.municipality);
      setBarangays(brgys);
      
      // Only reset if NOT initial mount and current barangay is not in new list
      if (!isInitialMount && values.barangay && !brgys.includes(values.barangay)) {
        onChange({ 
          ...values, 
          barangay: '' 
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
      province: '', 
      municipality: '', 
      barangay: '' 
    });
  };

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value;
    onChange({ 
      ...values,
      province: newProvince, 
      municipality: '', 
      barangay: '' 
    });
  };

  const handleMunicipalityChange = (e) => {
    const newMunicipality = e.target.value;
    onChange({ 
      ...values, 
      municipality: newMunicipality, 
      barangay: '' 
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
      <div className="space-y-2">
        <Label htmlFor="region">Region *</Label>
        <Select
          id="region"
          value={values.region}
          onChange={handleRegionChange}
          disabled={disabled}
          required
          className={errors.region ? 'border-red-500' : ''}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </Select>
        {errors.region && (
          <p className="text-red-500 text-sm">{errors.region}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province */}
        <div className="space-y-2">
          <Label htmlFor="province">Province *</Label>
          <Select
            id="province"
            value={values.province}
            onChange={handleProvinceChange}
            disabled={disabled || !values.region}
            required
            className={errors.province ? 'border-red-500' : ''}
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </Select>
          {errors.province && (
            <p className="text-red-500 text-sm">{errors.province}</p>
          )}
        </div>

        {/* Municipality */}
        <div className="space-y-2">
          <Label htmlFor="municipality">Municipality *</Label>
          <Select
            id="municipality"
            value={values.municipality}
            onChange={handleMunicipalityChange}
            disabled={disabled || !values.province}
            required
            className={errors.municipality ? 'border-red-500' : ''}
          >
            <option value="">Select Municipality</option>
            {municipalities.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </Select>
          {errors.municipality && (
            <p className="text-red-500 text-sm">{errors.municipality}</p>
          )}
        </div>

        {/* Barangay */}
        <div className="space-y-2">
          <Label htmlFor="barangay">Barangay *</Label>
          <Select
            id="barangay"
            value={values.barangay}
            onChange={handleBarangayChange}
            disabled={disabled || !values.municipality}
            required
            className={errors.barangay ? 'border-red-500' : ''}
          >
            <option value="">Select Barangay</option>
            {barangays.map((barangay) => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </Select>
          {errors.barangay && (
            <p className="text-red-500 text-sm">{errors.barangay}</p>
          )}
        </div>
      </div>
    </div>
  );
};
