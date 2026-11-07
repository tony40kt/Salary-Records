import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BannerAd,
  BannerAdSize,
  MobileAds,
} from 'react-native-google-mobile-ads';

export function AdBanner() {
  const [isInitialized, setIsInitialized] = useState(false);
  const adUnitId: unknown = Constants.expoConfig?.extra?.iosAdMobBannerId;

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    let isMounted = true;
    MobileAds()
      .initialize()
      .then(() => {
        if (isMounted) {
          setIsInitialized(true);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to initialize Google Mobile Ads SDK:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (Platform.OS !== 'ios' || !isInitialized) {
    return null;
  }

  if (typeof adUnitId !== 'string' || adUnitId.length === 0) {
    console.error('Missing iosAdMobBannerId in Expo app config.');
    return null;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdFailedToLoad={(error) => {
            console.error('Failed to load AdMob banner:', error);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    alignItems: 'center',
    borderTopColor: '#eee',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
});
