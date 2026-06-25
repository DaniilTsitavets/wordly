package com.wordly.backend.entity.converter;

import com.wordly.backend.entity.enums.ProgressStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ProgressStatusConverter implements AttributeConverter<ProgressStatus, String> {

    @Override
    public String convertToDatabaseColumn(ProgressStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public ProgressStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        for (ProgressStatus status : ProgressStatus.values()) {
            if (status.getValue().equals(dbData)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Unknown progress status: " + dbData);
    }
}