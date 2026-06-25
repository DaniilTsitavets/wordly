package com.wordly.backend.entity.converter;

import com.wordly.backend.entity.enums.MechanicType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class MechanicTypeConverter implements AttributeConverter<MechanicType, String> {

    @Override
    public String convertToDatabaseColumn(MechanicType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public MechanicType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        for (MechanicType type : MechanicType.values()) {
            if (type.getValue().equals(dbData)) {
                return type;
            }
        }

        throw new IllegalArgumentException("Unknown mechanic type: " + dbData);
    }
}