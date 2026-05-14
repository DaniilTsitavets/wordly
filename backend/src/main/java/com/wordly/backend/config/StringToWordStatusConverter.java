package com.wordly.backend.config;

import com.wordly.backend.entity.enums.WordStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToWordStatusConverter implements Converter<String, WordStatus> {

    @Override
    public WordStatus convert(String source) {
        return WordStatus.fromValue(source);
    }
}
