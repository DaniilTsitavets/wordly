package com.wordly.backend.entity.converter;

import com.wordly.backend.entity.enums.Role;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role attribute) {
        return attribute == null ? Role.USER.getValue() : attribute.getValue();
    }

    @Override
    public Role convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return Role.USER;
        }
        return Role.fromValue(dbData);
    }
}
