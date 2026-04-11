import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import { RoomsScreen } from '../screens/main/RoomsScreen';
import { JobsScreen } from '../screens/main/JobsScreen';
import { ServicesScreen } from '../screens/main/ServicesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { InboxScreen } from '../screens/main/InboxScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, string> = {
    Home: 'home-variant',
    Rooms: 'home-outline',
    Jobs: 'briefcase-outline',
    Services: 'account-group-outline',
    Inbox: 'chat-processing-outline',
    Profile: 'account-outline',
};

// ── Floating Pill Tab Bar ──────────────────────────────────
function FloatingTabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.outerWrap, { paddingBottom: insets.bottom || 10 }]}>
            <View style={styles.pill}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const iconName = TAB_ICONS[route.name] || 'circle';

                    const onPress = () => {
                        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={styles.tabItem}
                            onPress={onPress}
                            activeOpacity={0.7}
                        >
                            {isFocused ? (
                                <View style={styles.activeItem}>
                                    <MaterialCommunityIcons
                                        name={iconName.replace('-outline', '') as any}
                                        size={22}
                                        color="#000000"
                                    />
                                </View>
                            ) : (
                                <MaterialCommunityIcons
                                    name={iconName as any}
                                    size={22}
                                    color="#636366"
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Rooms" component={RoomsScreen} />
            <Tab.Screen name="Services" component={ServicesScreen} />
            <Tab.Screen name="Jobs" component={JobsScreen} />
            <Tab.Screen name="Inbox" component={InboxScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    outerWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingTop: 10,
        backgroundColor: 'transparent',
    },
    pill: {
        flexDirection: 'row',
        backgroundColor: '#1C1C1E',
        borderRadius: 40,
        paddingHorizontal: 8,
        paddingVertical: 8,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 12,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        minWidth: 48,
    },
    activeItem: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#00C896',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00C896',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
});
