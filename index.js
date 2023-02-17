import {useCallback, useEffect, useRef, useState} from 'react';
import {RefreshControl, SafeAreaView} from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Modalize} from 'react-native-modalize';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {
  Button,
  Gap,
  HeaderCommerce,
  HeaderPrimary,
  HeaderSelectCart,
  ItemCartDeliveryCommerce,
  ItemChooseDelivery,
  ItemListBankCommerce,
  ItemProductCartCommerce,
  Line,
  SkeletonDefault,
} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {dataDelivery} from './dataDelivery';
import {getData, rupiah, showMessage, storeData} from '../../utils';
import {useDispatch, useSelector} from 'react-redux';
import {
  checkoutCommerce,
  getAddressCommerce,
  getOngkirCommerce,
} from '../../redux/action';

const {width, height} = Dimensions.get('window');
const ItemRingkasann = ({title, price}) => {
  return (
    <View style={styles.wpInfoRingkasan}>
      <Text style={styles.titleRingkasan}>{title}</Text>
      <Text style={styles.titleRingkasan}>{price}</Text>
    </View>
  );
};

const CodeVoucher = () => {
  const navigation = useNavigation();
  return (
    <>
      <Text style={styles.txtPengiriman}>Masukkan Kode Voucher</Text>
      <TouchableOpacity
        style={styles.wpPromo}
        onPress={() => navigation.navigate('KuponCommerceV2')}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MaterialCommunityIcons
            name="brightness-percent"
            size={RFValue(24)}
            color="#C11F4B"
          />
          <View>
            <Text style={styles.txtPromo}>Masukkan Kode Voucher</Text>
          </View>
        </View>
        <SimpleLineIcons name="arrow-right" size={16} color="#4f4f4f" />
      </TouchableOpacity>
    </>
  );
};
const renderItem = ({item}, dispatch, modalizep) => {
  let id = item.id;
  let value = 0;
  let etd = '';
  let note = '';
  // lama
  item.costs.map(itemCosts => {
    itemCosts.cost.map(itemCost => {
      value = itemCost.value;
      let etdFilter = itemCost.etd.split(' ');
      etd = etdFilter[0] + ' Hari';
      note = itemCost.note;
    });
  });

  const data = {
    name: item.name,
    value: value,
    etd: etd,
    note: note,
  };

  const onHandleChoosePengiriman = () => {
    dispatch({type: 'GET_DATA_ONGKIR', value: data});
    modalizep.current?.close();
  };

  return (
    // <TouchableOpacity onPress={onHandleChoosePengiriman}>
    <TouchableOpacity onPress={onHandleChoosePengiriman}>
      <Line stylesLine={{marginVertical: RFValue(10)}} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: RFValue(15),
          paddingBottom: RFValue(15),
        }}>
        <View>
          <Text
            style={{
              fontSize: RFValue(12),
              fontFamily: 'Poppins-SemiBold',
              color: '#191919',
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: RFValue(10),
              fontFamily: 'Poppins-Regular',
              color: '#191919',
            }}>
            {etd}
          </Text>
        </View>
        <Text
          style={{
            fontSize: RFValue(12),
            fontFamily: 'Poppins-SemiBold',
            color: '#191919',
          }}>
          Rp {rupiah(value)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ItemDelivery = ({onPress, data}) => {
  return (
    <>
      <Text style={styles.txtPengiriman}>Pengiriman</Text>
      <TouchableOpacity style={styles.wpBoxDelivery} onPress={onPress}>
        <View>
          <Text style={styles.txtKindDelivery}>{data.name}</Text>
          <Text style={styles.txtEstimasi}>Estimasi tiba {data.etd}</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.txtPriceAddress}>IDR {rupiah(data.value)}</Text>
          <SimpleLineIcons
            name="arrow-right"
            size={RFValue(16)}
            color="#4f4f4f"
          />
        </View>
      </TouchableOpacity>
    </>
  );
};

const DefaultItemDelivery = ({onPress}) => {
  return (
    <>
      <Text style={styles.txtPengiriman}>Pengiriman</Text>
      <TouchableOpacity style={styles.wpBoxDelivery} onPress={onPress}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MaterialCommunityIcons
            name="truck-delivery"
            size={RFValue(24)}
            color="#C11F4B"
          />
          <Text style={styles.txtPromo}>Pilih Alamat Pengiriman</Text>
        </View>
        <SimpleLineIcons name="arrow-right" size={16} color="#4f4f4f" />
      </TouchableOpacity>
    </>
  );
};

const DeliveryCommerce = ({navigation}) => {
  const dispatch = useDispatch();
  const modalizeRef = useRef(null);
  const biayaTransaki = 4000;
  const [refreshing, setRefreshing] = useState(false);
  const {
    listAddress,
    isLoadingListAddress,
    cekOngkir,
    dataOngkir,
    isLoadingCekOngkir,
  } = useSelector(state => state.addressCommerceReducer);
  const {
    dataSendCheckout,
    dataTotalPrice,
    myCartCommerceInformationSelected,
    isLoadingCheckoutCommerce,
  } = useSelector(state => state.commerceReducer);

  const destination = listAddress?.[0]?.subdistrict;
  const origin_subdistrict_id = 114;
  const destination_subdistrict_id = destination;
  const courier = 'jne:pos:tiki:sicepat:jnt';
  const berat = 1000;

  const onHandleSubmitCheckout = () => {
    if (dataOngkir?.length === 0) {
      showMessage('Pilih pengiriman terlebih dahulu');
      return;
    }
    if (listAddress?.length === 0) {
      showMessage('Pilih alamat terlebih dahulu');
      return;
    } else {
      const totalBiaya =
        dataTotalPrice +
        (dataOngkir && dataOngkir?.value ? dataOngkir?.value : 0) +
        biayaTransaki;
      const discount = 0;
      const title_address = 'Rumah';
      const name = listAddress?.[0]?.name;
      const phone = listAddress?.[0]?.phone;
      const address = listAddress?.[0]?.address;
      const province = listAddress?.[0]?.province;
      const city = listAddress?.[0]?.city;
      const subdistrict = listAddress?.[0]?.subdistrict;
      const kode_pos = listAddress?.[0]?.kode_pos;
      const notes = '';

      // product
      const product_id = dataSendCheckout[0].id;
      const product_attribute_id = 1;
      const store_id = dataSendCheckout[0].storeId;
      const qty = dataSendCheckout[0].qty;
      const notesProduct = '';
      const harga_item = dataSendCheckout[0].price;
      const harga_total_item = dataSendCheckout[0].price;
      const diskon = 0;
      const courierProduct = dataOngkir?.name;
      const cost_courier = dataOngkir?.value;
      const total_bayar =
        dataTotalPrice +
        (dataOngkir && dataOngkir?.value ? dataOngkir?.value : 0) +
        biayaTransaki;

      const data = `{
      "address": "${address}", 
      "city": "${city}",
      "discount": "${discount}",
      "kode_pos": "${kode_pos}",
      "name": "${name}",
      "notes": "${notes}",
      "phone": "${phone}",
      "products": [
        ${dataSendCheckout.map(
          item => `{
          "courier": "${courierProduct}",
          "cost_courier": "${cost_courier}",
          "diskon": "${diskon}",
          "harga_item": "${item.price}",
          "harga_total_item": "${item.price * item.qty}",
          "notes": "${notesProduct}",
          "product_attribute_id": "${item.product_attribute_id}",
          "product_id": "${item.product_id}",
          "qty": "${item.qty}",
          "store_id": "${store_id}",
          "total_bayar": "${total_bayar}"
        }`,
        )}
      ], 
      "province": "${province}",
      "subdistrict": "${subdistrict}",
      "title_address": "${title_address}",
      "total_payment": "${totalBiaya}"
    }`;
      const formData = new FormData();
      formData.append('formdata', data);
      console.log('data', data);
      dispatch(checkoutCommerce(formData, navigation));
    }
  };

  useEffect(() => {
    dispatch(getAddressCommerce());
    dispatch(
      getOngkirCommerce(
        origin_subdistrict_id,
        destination_subdistrict_id,
        courier,
        berat,
      ),
    );
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(getAddressCommerce());
    dispatch(
      getOngkirCommerce(
        origin_subdistrict_id,
        destination_subdistrict_id,
        courier,
        berat,
      ),
    );
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.page}>
      <HeaderPrimary
        onPress={() => {
          dispatch({type: 'GET_DATA_SEND_CHECKOUT', value: []});
          dispatch({type: 'GET_NON_CHECK_ALL', value: false});
          dispatch({
            type: 'GET_CART_COMMERCE_INFORMATION_SELECTED',
            value: (() => {
              let a = myCartCommerceInformationSelected;
              for (let k of Object.keys(a)) {
                a[k] = Object.assign(a[k], {selected: false});
              }
              return a;
            })(),
          });
          navigation.goBack();
        }}
        title={'Transaksi'}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          <Text style={styles.textSetAddress}>Alamat Pengiriman</Text>
          {isLoadingListAddress ? (
            <SkeletonDefault
              stylesSkeleton={{
                borderRadius: RFValue(8),
                height: RFValue(60),
                marginBottom: RFValue(8),
              }}
            />
          ) : (
            listAddress && (
              <TouchableOpacity
                style={styles.wpSetAddress}
                onPress={() => navigation.navigate('ListAddressCommerceV2')}>
                <View style={{flexDirection: 'row'}}>
                  <Entypo
                    name="location-pin"
                    size={RFValue(24)}
                    color="#202020"
                  />
                  <View style={styles.wpNameAddress}>
                    <Text style={styles.infoSetAddress}>
                      {listAddress?.[0]?.name} | {listAddress?.[0]?.phone}
                    </Text>
                    <Text style={styles.textAddress}>
                      {listAddress?.[0]?.address}
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={RFValue(16)}
                  color="#222222"
                />
              </TouchableOpacity>
            )
          )}
          <View>
            <>
              {isLoadingListAddress ? (
                <SkeletonDefault
                  stylesSkeleton={{
                    borderRadius: RFValue(8),
                    height: RFValue(150),
                    marginBottom: RFValue(8),
                  }}
                />
              ) : (
                <>
                  {dataSendCheckout.map(item => {
                    return (
                      <>
                        <HeaderSelectCart
                          key={item.storeId}
                          image={item.imageStore}
                          name={item.nameStore}
                          type="transaksi"
                          stylesContainer={{
                            paddingHorizontal: RFValue(-1),
                            marginBottom: RFValue(10),
                          }}
                        />
                        <ItemProductCartCommerce
                          stylesWpPrice={{width: wp('60%')}}
                          notCheckbox
                          key={item.product.id}
                          name={item.product.name}
                          color={item.color}
                          size={item.size}
                          price={item.price * item.qty}
                          nameProduct={item.color}
                          image={item.product.media[0].file}
                          alternativeImage={item?.product?.media?.[1]?.file}
                          stylesContainer={{marginHorizontal: RFValue(-1)}}
                        />
                        <ItemDelivery
                          key={item.storeId}
                          onPress={() => modalizeRef?.current?.open()}
                          // data={dataOngkir}
                          //give the difference value of the delivery cost, not auto fill the delivery cost
                          data={item.cost_courier}
                        />
                      </>
                    );
                  })}
                </>
              )}
            </>
            <Gap height={RFValue(16)} />
          </View>
          <Line
            stylesLine={{
              marginVertical: RFValue(20),
              height: RFValue(3),
              marginHorizontal: RFValue(-15),
            }}
          />

          {/* <>
            {isLoadingCekOngkir ? (
              <SkeletonDefault
                stylesSkeleton={{
                  borderRadius: RFValue(8),
                  height: RFValue(100),
                  marginBottom: RFValue(8),
                }}
              />
            ) : dataOngkir?.length !== 0 ? (
              <ItemDelivery
                onPress={() => modalizeRef?.current?.open()}
                data={dataOngkir}
              />
            ) : (
              <DefaultItemDelivery
                onPress={() => modalizeRef?.current?.open()}
                data={dataOngkir}
              />
            )}
          </> */}
          <Line
            stylesLine={{
              marginVertical: RFValue(20),
              height: RFValue(3),
              marginHorizontal: RFValue(-15),
            }}
          />
          <>
            {isLoadingCekOngkir ? (
              <SkeletonDefault
                stylesSkeleton={{
                  borderRadius: RFValue(8),
                  height: RFValue(100),
                  marginBottom: RFValue(8),
                }}
              />
            ) : (
              <>
                <CodeVoucher />
                <Gap height={20} />
                <View style={styles.wpRingkasan}>
                  <Text style={styles.textRingkasan}>Ringkasan Belanja</Text>
                  <Gap height={10} />
                  <ItemRingkasann
                    title={`Total Harga (${dataSendCheckout?.length} Barang)`}
                    price={`IDR ${rupiah(dataTotalPrice)}`}
                  />
                  <ItemRingkasann
                    title={'Total Ongkos Kirim'}
                    // price={`IDR ${rupiah(
                    //   dataOngkir && dataOngkir?.value * dataSendCheckout?.length
                    //     ? dataOngkir?.value
                    //     : 0,
                    // )}`}
                    price={`IDR ${rupiah(
                      dataOngkir && dataOngkir?.value
                        ? dataOngkir?.value * dataSendCheckout?.length
                        : 0,
                    )}`}
                  />
                  <ItemRingkasann
                    title={'Biaya Transaksi'}
                    price={`IDR ${rupiah(biayaTransaki)}`}
                  />
                </View>
              </>
            )}
          </>
        </View>
      </ScrollView>
      <View style={styles.tagihan}>
        <Text style={styles.textRules}>
          Dengan Membayar, saya menyetujui {''}
          <Text style={{color: '#CE2562'}}>
            Syarat dan Ketentuan yang Berlaku
          </Text>
        </Text>
        <Gap height={8} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Text style={[styles.textRingkasan, {fontSize: RFValue(13)}]}>
              Total Tagihan
            </Text>
            <Text style={styles.priceTagihan}>
              IDR{' '}
              {rupiah(
                dataTotalPrice +
                  (dataOngkir && dataOngkir?.value ? dataOngkir?.value : 0) +
                  biayaTransaki,
              )}
            </Text>
          </View>
          <Button
            title={'Pilih Pembayaran'}
            stylesButton={{width: wp('50%')}}
            onPress={onHandleSubmitCheckout}
            loading={isLoadingCheckoutCommerce}
            disabled={isLoadingCheckoutCommerce}
          />
        </View>
      </View>
      <Modalize
        snapPoint={RFValue(385)}
        modalTopOffset={RFValue(385)}
        ref={modalizeRef}
        closeOnOverlayTap
        onClosed={() => {}}
        adjustToContentHeight={true}
        disableScrollIfPossible={false}
        onOverlayPress={() => modalizeRef.current?.close()}
        HeaderComponent={
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: RFValue(15),
              paddingTop: RFValue(15),
            }}>
            <Text style={styles.txtChooseKurir}>Pilih Kurir</Text>
            <TouchableOpacity onPress={() => modalizeRef.current?.close()}>
              <AntDesign name="close" size={RFValue(24)} color="#202020" />
            </TouchableOpacity>
          </View>
        }
        flatListProps={{
          data: cekOngkir,
          renderItem: item => renderItem(item, dispatch, modalizeRef),
          keyExtractor: item => item.id,
          showsVerticalScrollIndicator: false,
        }}></Modalize>
    </SafeAreaView>
  );
};

export default DeliveryCommerce;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: RFValue(15),
    paddingTop: RFValue(15),
  },
  wpSetAddress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: RFValue(1),
    borderColor: '#d4d4d4',
    borderRadius: RFValue(8),
    padding: RFValue(8),
    marginBottom: RFValue(20),
    alignItems: 'flex-start',
  },
  wpNameAddress: {
    maxWidth: '90%',
    marginLeft: RFValue(12),
  },
  textSetAddress: {
    fontFamily: 'Poppins-SemiBold',
    color: '#191919',
    fontSize: RFValue(12),
    marginBottom: RFValue(12),
  },
  infoSetAddress: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    fontSize: RFValue(11),
  },
  textAddress: {
    fontFamily: 'Poppins-Regular',
    color: '#7F7F7F',
    fontSize: RFValue(10),
  },
  seeAll: {
    fontFamily: 'Poppins-Regular',
    color: '#C11F4B',
    fontSize: RFValue(12),
  },
  wpPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: RFValue(1),
    borderColor: '#d4d4d4',
    borderRadius: RFValue(8),
    padding: RFValue(12),
    justifyContent: 'space-between',
  },
  txtPromo: {
    marginLeft: RFValue(14),
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    fontSize: RFValue(12),
  },
  textRingkasan: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Medium',
    color: '#191919',
  },
  wpRingkasan: {
    marginBottom: RFValue(5),
  },
  wpInfoRingkasan: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RFValue(8),
  },
  textRules: {
    fontSize: RFValue(10),
    fontFamily: 'Poppins-SemiBold',
    color: '#4F4F4F',
  },
  tagihan: {
    padding: RFValue(15),
    borderRadius: RFValue(100),
  },
  priceTagihan: {
    fontSize: RFValue(16),
    fontFamily: 'Poppins-SemiBold',
    color: '#4F4F4F',
  },
  wpModal: {
    paddingHorizontal: RFValue(15),
    paddingTop: RFValue(15),
  },
  wpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txtHeader: {
    marginLeft: RFValue(12),
    fontSize: RFValue(20),
    fontFamily: 'Poppins-SemiBold',
    color: '#4f4f4f',
  },
  titleRingkasan: {
    fontSize: RFValue(11),
    fontFamily: 'Poppins-Regular',
    color: '#828282',
  },
  wpBoxDelivery: {
    borderRadius: RFValue(8),
    alignItems: 'center',
    borderWidth: RFValue(1),
    borderColor: '#d4d4d4',
    padding: RFValue(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txtPengiriman: {
    fontSize: RFValue(12),
    color: '#191919',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: RFValue(8),
  },
  txtKindDelivery: {
    color: '#333333',
    fontFamily: 'Poppins-SemiBold',
    fontSize: RFValue(12),
    marginBottom: RFValue(1),
  },
  txtEstimasi: {
    color: '#7F7F7F',
    fontFamily: 'Poppins-Regular',
    fontSize: RFValue(11),
  },
  txtPriceAddress: {
    color: '#C11F4B',
    fontFamily: 'Poppins-SemiBold',
    fontSize: RFValue(12),
    marginRight: RFValue(12),
  },
  txtChooseKurir: {
    padding: RFValue(15),
    color: '#191919',
    fontFamily: 'Poppins-SemiBold',
    fontSize: RFValue(14),
  },
});
