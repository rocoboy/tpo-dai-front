import theme from '@/constants/types';
import { useAppContext } from '@/context/Context';
import { ActivityIndicator, View } from 'react-native';

export default function LoadingScreen() {
    const { loading: { isLoading } } = useAppContext();

    return (
        <View>
            {isLoading && 
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.background,
                }}>
                    <ActivityIndicator size="large" color={theme.colors.secondary} />
                </View>
            </View>}
        </View>

    );
}

