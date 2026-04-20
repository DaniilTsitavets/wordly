package com.wordly.backend.entity.converter;

import com.wordly.backend.entity.enums.WordStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class WordStatusConverter implements AttributeConverter<WordStatus, String> {

    @Override
    public String convertToDatabaseColumn(WordStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public WordStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return WordStatus.fromValue(dbData);
    }
}
