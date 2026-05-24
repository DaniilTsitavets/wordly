package com.wordly.backend.entity.converter;

import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import com.wordly.backend.entity.enums.WordStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JPA Attribute Converters")
class ConvertersTest {

    @Nested
    @DisplayName("MechanicTypeConverter")
    class MechanicTypeConverterTest {

        private final MechanicTypeConverter converter = new MechanicTypeConverter();

        @Test
        @DisplayName("convertToDatabaseColumn: null → null")
        void toColumn_null() {
            assertThat(converter.convertToDatabaseColumn(null)).isNull();
        }

        @Test
        @DisplayName("convertToDatabaseColumn: enum → its string value")
        void toColumn_eachValue() {
            assertThat(converter.convertToDatabaseColumn(MechanicType.MNEMONIC_CARDS)).isEqualTo("mnemonic_cards");
            assertThat(converter.convertToDatabaseColumn(MechanicType.FLASHCARDS)).isEqualTo("flashcards");
            assertThat(converter.convertToDatabaseColumn(MechanicType.MATCHING)).isEqualTo("matching");
            assertThat(converter.convertToDatabaseColumn(MechanicType.FILLING_GAPS)).isEqualTo("filling_gaps");
            assertThat(converter.convertToDatabaseColumn(MechanicType.WORD_BUILDER)).isEqualTo("word_builder");
        }

        @Test
        @DisplayName("convertToEntityAttribute: null → null")
        void toAttribute_null() {
            assertThat(converter.convertToEntityAttribute(null)).isNull();
        }

        @Test
        @DisplayName("convertToEntityAttribute: valid string → correct enum")
        void toAttribute_validStrings() {
            assertThat(converter.convertToEntityAttribute("flashcards")).isEqualTo(MechanicType.FLASHCARDS);
            assertThat(converter.convertToEntityAttribute("matching")).isEqualTo(MechanicType.MATCHING);
            assertThat(converter.convertToEntityAttribute("word_builder")).isEqualTo(MechanicType.WORD_BUILDER);
        }

        @Test
        @DisplayName("convertToEntityAttribute: unknown value → IllegalArgumentException")
        void toAttribute_unknownValue() {
            assertThatThrownBy(() -> converter.convertToEntityAttribute("unknown"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("ProgressStatusConverter")
    class ProgressStatusConverterTest {

        private final ProgressStatusConverter converter = new ProgressStatusConverter();

        @Test
        @DisplayName("convertToDatabaseColumn: null → null")
        void toColumn_null() {
            assertThat(converter.convertToDatabaseColumn(null)).isNull();
        }

        @Test
        @DisplayName("convertToDatabaseColumn: enum → its string value")
        void toColumn_eachValue() {
            assertThat(converter.convertToDatabaseColumn(ProgressStatus.LOCKED)).isEqualTo("locked");
            assertThat(converter.convertToDatabaseColumn(ProgressStatus.UNBLOCKED)).isEqualTo("unblocked");
            assertThat(converter.convertToDatabaseColumn(ProgressStatus.IN_PROGRESS)).isEqualTo("in_progress");
            assertThat(converter.convertToDatabaseColumn(ProgressStatus.COMPLETED)).isEqualTo("completed");
        }

        @Test
        @DisplayName("convertToEntityAttribute: null → null")
        void toAttribute_null() {
            assertThat(converter.convertToEntityAttribute(null)).isNull();
        }

        @Test
        @DisplayName("convertToEntityAttribute: valid string → correct enum")
        void toAttribute_validStrings() {
            assertThat(converter.convertToEntityAttribute("locked")).isEqualTo(ProgressStatus.LOCKED);
            assertThat(converter.convertToEntityAttribute("completed")).isEqualTo(ProgressStatus.COMPLETED);
            assertThat(converter.convertToEntityAttribute("in_progress")).isEqualTo(ProgressStatus.IN_PROGRESS);
        }

        @Test
        @DisplayName("convertToEntityAttribute: unknown value → IllegalArgumentException")
        void toAttribute_unknownValue() {
            assertThatThrownBy(() -> converter.convertToEntityAttribute("unknown"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("WordStatusConverter")
    class WordStatusConverterTest {

        private final WordStatusConverter converter = new WordStatusConverter();

        @Test
        @DisplayName("convertToDatabaseColumn: null → null")
        void toColumn_null() {
            assertThat(converter.convertToDatabaseColumn(null)).isNull();
        }

        @Test
        @DisplayName("convertToDatabaseColumn: enum → its string value")
        void toColumn_eachValue() {
            assertThat(converter.convertToDatabaseColumn(WordStatus.NEW)).isEqualTo("new");
            assertThat(converter.convertToDatabaseColumn(WordStatus.LEARNING)).isEqualTo("learning");
            assertThat(converter.convertToDatabaseColumn(WordStatus.RECALLING)).isEqualTo("recalling");
            assertThat(converter.convertToDatabaseColumn(WordStatus.LONG_TERM_MEMORY)).isEqualTo("long_term_memory");
        }

        @Test
        @DisplayName("convertToEntityAttribute: null → null")
        void toAttribute_null() {
            assertThat(converter.convertToEntityAttribute(null)).isNull();
        }

        @Test
        @DisplayName("convertToEntityAttribute: valid string → correct enum")
        void toAttribute_validStrings() {
            assertThat(converter.convertToEntityAttribute("new")).isEqualTo(WordStatus.NEW);
            assertThat(converter.convertToEntityAttribute("learning")).isEqualTo(WordStatus.LEARNING);
            assertThat(converter.convertToEntityAttribute("recalling")).isEqualTo(WordStatus.RECALLING);
            assertThat(converter.convertToEntityAttribute("long_term_memory")).isEqualTo(WordStatus.LONG_TERM_MEMORY);
        }

        @Test
        @DisplayName("convertToEntityAttribute: unknown value → IllegalArgumentException")
        void toAttribute_unknownValue() {
            assertThatThrownBy(() -> converter.convertToEntityAttribute("unknown"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("StringListJsonConverter")
    class StringListJsonConverterTest {

        private final StringListJsonConverter converter = new StringListJsonConverter();

        @Test
        @DisplayName("convertToDatabaseColumn: null → empty JSON array")
        void toColumn_null() {
            assertThat(converter.convertToDatabaseColumn(null)).isEqualTo("[]");
        }

        @Test
        @DisplayName("convertToDatabaseColumn: empty list → '[]'")
        void toColumn_emptyList() {
            assertThat(converter.convertToDatabaseColumn(List.of())).isEqualTo("[]");
        }

        @Test
        @DisplayName("convertToDatabaseColumn: list with values → JSON array string")
        void toColumn_withValues() {
            String result = converter.convertToDatabaseColumn(List.of("mnemonic_cards", "matching"));
            assertThat(result).isEqualTo("[\"mnemonic_cards\",\"matching\"]");
        }

        @Test
        @DisplayName("convertToEntityAttribute: null → empty list")
        void toAttribute_null() {
            assertThat(converter.convertToEntityAttribute(null)).isEmpty();
        }

        @Test
        @DisplayName("convertToEntityAttribute: blank string → empty list")
        void toAttribute_blank() {
            assertThat(converter.convertToEntityAttribute("")).isEmpty();
            assertThat(converter.convertToEntityAttribute("   ")).isEmpty();
        }

        @Test
        @DisplayName("convertToEntityAttribute: valid JSON array → list of strings")
        void toAttribute_validJson() {
            List<String> result = converter.convertToEntityAttribute("[\"mnemonic_cards\",\"matching\"]");
            assertThat(result).containsExactly("mnemonic_cards", "matching");
        }

        @Test
        @DisplayName("convertToEntityAttribute: invalid JSON → IllegalArgumentException")
        void toAttribute_invalidJson() {
            assertThatThrownBy(() -> converter.convertToEntityAttribute("not-json"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("roundtrip: list → column → entity preserves values")
        void roundtrip() {
            List<String> original = List.of("flashcards", "word_builder");
            String column = converter.convertToDatabaseColumn(original);
            List<String> restored = converter.convertToEntityAttribute(column);
            assertThat(restored).isEqualTo(original);
        }
    }
}