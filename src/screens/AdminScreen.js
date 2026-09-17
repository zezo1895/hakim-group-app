import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS, FONT_SIZES } from '../theme';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { api } from '../api/client';
import { syncService } from '../services/syncService';
import { storage } from '../services/storage';

export default function AdminScreen({ navigation }) {
  const deviceInfo = useDeviceInfo();
  const [analytics, setAnalytics] = useState({ topSearches: [], topProducts: [] });
  const [syncInfo, setSyncInfo] = useState({ lastSync: 'لم يتم', productCount: 0 });
  const [appVersion, setAppVersion] = useState({ latestVersion: 'جاري التحميل...', downloadUrl: '' });
  const [newApkUrl, setNewApkUrl] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingUpdate, setIsRequestingUpdate] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchSyncInfo();
    fetchAppVersion();
  }, []);

  const fetchAppVersion = async () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { t, i18n } = useTranslation();
    try {
      if (api && api.checkAppVersion) {
        const data = await api.checkAppVersion();
        if (data) {
          setAppVersion(data);
          setNewApkUrl(data.downloadUrl || '');
        }
      }
    } catch (e) { console.log(e); }
  };

  const fetchAnalytics = async () => {
    try {
      if (api && api.getAnalytics) {
        const data = await api.getAnalytics();
        if (data) {
          setAnalytics({
            topSearches: data.top_searches || [],
            topProducts: data.top_products || [],
          });
        }
      }
    } catch (error) {
      console.log('Error fetching analytics', error);
    }
  };

  const fetchSyncInfo = async () => {
    try {
      let lastSync = null;
      if (storage && storage.getLastSync) {
        lastSync = await storage.getLastSync();
      }
      
      const localData = await syncService.getLocalData();
      
      let dateString = 'لم يتم المزامنة';
      if (lastSync) {
        dateString = new Date(lastSync).toLocaleString('ar-EG');
      }

      setSyncInfo({
        lastSync: dateString,
        productCount: localData && localData.products ? localData.products.length : 0,
      });
    } catch (error) {
      console.log('Error fetching sync info', error);
    }
  };

  const handleManualSync = async () => {
    Alert.alert('جاري المزامنة', 'برجاء الانتظار...');
    try {
      await syncService.fullSync(() => {});
      await fetchSyncInfo();
      Alert.alert('نجاح', 'تمت المزامنة بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في المزامنة');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'تأكيد',
      'هل أنت متأكد من مسح الذاكرة المؤقتة؟ سيتم حذف جميع المنتجات المحفوظة محلياً.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'مسح', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (storage && storage.clearData) {
                await storage.clearData();
              }
              await fetchSyncInfo();
              Alert.alert('نجاح', 'تم مسح الذاكرة المؤقتة');
            } catch (error) {
              Alert.alert('خطأ', 'فشل مسح الذاكرة المؤقتة');
            }
          }
        }
      ]
    );
  };

  const handleRequestUpdate = async () => {
    if (!newApkUrl || newApkUrl.trim() === '') {
      Alert.alert('خطأ', 'يرجى إدخال رابط التحميل أولاً');
      return;
    }
    setIsRequestingUpdate(true);
    try {
      await api.requestAppUpdate(newApkUrl, '123456');
      setOtpModalVisible(true);
      Alert.alert('تم الإرسال', 'تم إرسال كود التحقق إلى البريد الإلكتروني الخاص بك');
    } catch (error) {
      Alert.alert('خطأ', error.message || 'فشل إرسال طلب التحديث');
    }
    setIsRequestingUpdate(false);
  };

  const handleConfirmUpdate = async () => {
    if (!otpCode || otpCode.trim() === '') {
      Alert.alert('خطأ', 'يرجى إدخال كود التحقق');
      return;
    }
    try {
      const res = await api.confirmAppUpdate(otpCode, '123456');
      setOtpModalVisible(false);
      setOtpCode('');
      setAppVersion({ latestVersion: res.newVersion, downloadUrl: res.downloadUrl });
      Alert.alert('نجاح', `تم تحديث التطبيق إلى الإصدار ${res.newVersion} بنجاح. سيتم فرضه على جميع المستخدمين.`);
    } catch (error) {
      Alert.alert('خطأ', error.message || 'كود التحقق غير صحيح أو منتهي الصلاحية');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </Pressable>
      <Text style={styles.headerTitle}>لوحة التحكم 🔒</Text>
      <View style={styles.backButton} />
    </View>
  );

  const maxSearchCount = Math.max(...analytics.topSearches.map(s => s.count || 0), 1);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Card 0: Update Management */}
        <View style={[styles.card, SHADOWS.medium]}>
          <Text style={styles.cardTitle}>إدارة التحديثات (APK)</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>رقم الإصدار الحالي للشبكة:</Text>
            <Text style={[styles.infoValue, { color: colors.primary, fontWeight: 'bold' }]}>{appVersion.latestVersion}</Text>
          </View>
          
          <Text style={[styles.infoLabel, { marginTop: SPACING.md, marginBottom: SPACING.xs }]}>رابط التحميل للنسخة الجديدة:</Text>
          <View style={{
            borderWidth: 1, borderColor: colors.border, borderRadius: RADIUS.md, 
            paddingHorizontal: SPACING.sm, marginBottom: SPACING.md, backgroundColor: colors.surfaceAlt
          }}>
            <TextInput
              style={{ height: 40, textAlign: 'right', color: colors.text }}
              placeholder="ضع رابط التحميل هنا..."
              value={newApkUrl}
              onChangeText={setNewApkUrl}
            />
          </View>

          <Pressable 
            style={[styles.button, { backgroundColor: isRequestingUpdate ? colors.textLight : colors.primary }]} 
            onPress={handleRequestUpdate}
            disabled={isRequestingUpdate}
          >
            <Text style={styles.buttonText}>{isRequestingUpdate ? 'جاري الإرسال...' : 'نشر التحديث لجميع المناديب'}</Text>
          </Pressable>
        </View>

        {/* Card 1: Device Info */}
        <View style={[styles.card, SHADOWS.medium]}>
          <Text style={styles.cardTitle}>معلومات الجهاز</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>اسم الجهاز:</Text><Text style={styles.infoValue}>{deviceInfo.deviceName}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>الماركة:</Text><Text style={styles.infoValue}>{deviceInfo.brand}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>الموديل:</Text><Text style={styles.infoValue}>{deviceInfo.modelName}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>النظام:</Text><Text style={styles.infoValue}>{`${deviceInfo.osName} ${deviceInfo.osVersion}`}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>عنوان IP:</Text><Text style={styles.infoValue}>{deviceInfo.ipAddress}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>نوع الاتصال:</Text><Text style={styles.infoValue}>{deviceInfo.networkType}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>معرف الجهاز:</Text><Text style={styles.infoValue}>{deviceInfo.installationId}</Text></View>
        </View>

        {/* Card 2: Search Analytics */}
        <View style={[styles.card, SHADOWS.medium]}>
          <Text style={styles.cardTitle}>أكثر الكلمات بحثاً</Text>
          {analytics.topSearches.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد بيانات</Text>
          ) : (
            analytics.topSearches.map((item, index) => (
              <View key={index} style={styles.barChartRow}>
                <View style={styles.barChartLabels}>
                  <Text style={styles.barChartQuery} numberOfLines={1}>{item.query}</Text>
                  <Text style={styles.barChartCount}>{item.count}</Text>
                </View>
                <View style={styles.barChartTrack}>
                  <View style={[styles.barChartFill, { width: `${(item.count / maxSearchCount) * 100}%` }]} />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Card 3: Top Products */}
        <View style={[styles.card, SHADOWS.medium]}>
          <Text style={styles.cardTitle}>أكثر المنتجات مشاهدة</Text>
          {analytics.topProducts.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد بيانات</Text>
          ) : (
            analytics.topProducts.map((item, index) => (
              <View key={index} style={styles.productRow}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.viewCountContainer}>
                  <Text style={styles.viewCount}>{item.views}</Text>
                  <Text style={styles.eyeIcon}>👁️</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Card 4: Sync Info */}
        <View style={[styles.card, SHADOWS.medium]}>
          <Text style={styles.cardTitle}>معلومات المزامنة</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>آخر مزامنة:</Text><Text style={styles.infoValue}>{syncInfo.lastSync}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>المنتجات المخزنة:</Text><Text style={styles.infoValue}>{syncInfo.productCount}</Text></View>
          
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.syncButton]} onPress={handleManualSync}>
              <Text style={styles.buttonText}>مزامنة الآن</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.clearButton]} onPress={handleClearCache}>
              <Text style={[styles.buttonText, {color: colors.error}]}>مسح الذاكرة المؤقتة</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>

      {/* OTP Modal */}
      <Modal visible={otpModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', backgroundColor: colors.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center' }}>
            <Text style={{ fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: colors.text, marginBottom: SPACING.md }}>أدخل كود التحقق (OTP)</Text>
            <Text style={{ fontSize: FONT_SIZES.sm, color: colors.textSecondary, marginBottom: SPACING.lg, textAlign: 'center' }}>
              تم إرسال كود مكون من 6 أرقام إلى بريدك الإلكتروني
            </Text>
            
            <TextInput
              style={{ 
                width: '100%', height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: RADIUS.md,
                textAlign: 'center', fontSize: FONT_SIZES.xl, letterSpacing: 5, marginBottom: SPACING.xl
              }}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
            />

            <View style={{ flexDirection: 'row', width: '100%', gap: SPACING.md }}>
              <Pressable style={[styles.button, { flex: 1, backgroundColor: colors.textLight }]} onPress={() => setOtpModalVisible(false)}>
                <Text style={styles.buttonText}>إلغاء</Text>
              </Pressable>
              <Pressable style={[styles.button, { flex: 1, backgroundColor: colors.primary }]} onPress={handleConfirmUpdate}>
                <Text style={styles.buttonText}>تأكيد</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 24, color: colors.primary, fontWeight: 'bold' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: colors.text, writingDirection: 'rtl' },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  card: { backgroundColor: '#FFFFFF', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: colors.primary, marginBottom: SPACING.md, textAlign: 'right', writingDirection: 'rtl', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  infoLabel: { fontSize: FONT_SIZES.md, color: colors.textSecondary, fontWeight: 'bold', textAlign: 'right', writingDirection: 'rtl' },
  infoValue: { fontSize: FONT_SIZES.md, color: colors.text, textAlign: 'left', flex: 1, paddingLeft: SPACING.md },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginVertical: SPACING.sm },
  barChartRow: { marginBottom: SPACING.md },
  barChartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  barChartQuery: { fontSize: FONT_SIZES.sm, color: colors.text, flex: 1, textAlign: 'right', writingDirection: 'rtl' },
  barChartCount: { fontSize: FONT_SIZES.sm, color: colors.textSecondary, fontWeight: 'bold', marginLeft: SPACING.sm },
  barChartTrack: { height: 8, backgroundColor: colors.surface, borderRadius: RADIUS.round, overflow: 'hidden' },
  barChartFill: { height: '100%', backgroundColor: colors.primary, borderRadius: RADIUS.round },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  productName: { fontSize: FONT_SIZES.md, color: colors.text, flex: 1, textAlign: 'right', writingDirection: 'rtl' },
  viewCountContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.md },
  viewCount: { fontSize: FONT_SIZES.md, color: colors.textSecondary, marginRight: SPACING.xs, fontWeight: 'bold' },
  eyeIcon: { fontSize: FONT_SIZES.md },
  buttonContainer: { marginTop: SPACING.lg, gap: SPACING.md },
  button: { paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  syncButton: { backgroundColor: colors.primary },
  clearButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.error },
  buttonText: { color: '#FFFFFF', fontSize: FONT_SIZES.md, fontWeight: 'bold' },
});
