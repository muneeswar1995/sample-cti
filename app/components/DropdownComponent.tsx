import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Icon } from '@/lib/layout';
import { useTheme } from '@/lib/appTheme';

export interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownComponentProps {
  data: DropdownItem[];
  value: string;
  onChange: (item: DropdownItem) => void;
  placeholder?: string;
  style?: any;
}

export const DropdownComponent: React.FC<DropdownComponentProps> = ({
  data,
  value,
  onChange,
  placeholder = 'Select option',
  style,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = data.find((item) => String(item.value) === String(value));

  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
          },
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: selectedItem
                ? theme.palette.text.primary
                : theme.palette.text.secondary,
            },
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Icon
          name="chevron-down"
          type="feather"
          size={16}
          color={theme.palette.text.primary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                  },
                ]}
              >
                <ScrollView style={{ maxHeight: 220 }}>
                  {data.map((item, index) => {
                    const isSelected = String(item.value) === String(value);
                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.optionItem,
                          index < data.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: theme.palette.divider,
                          },
                          isSelected && {
                            backgroundColor:
                              theme.palette.mode === 'dark'
                                ? '#1E293B'
                                : '#F1F5F9',
                          },
                        ]}
                        onPress={() => {
                          onChange(item);
                          setIsOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: theme.palette.text.primary },
                            isSelected && {
                              fontWeight: '600',
                              color: theme.palette.primary.main,
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <Icon
                            name="check"
                            type="feather"
                            size={14}
                            color={theme.palette.primary.main}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 14,
  },
});
