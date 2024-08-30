import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {vh, vw} from '../../utitils/theme';
import MapView, {Marker, Callout} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const Map = ({navigation, route}) => {
  const [text, onChangeText] = useState('');
  const [position, setPosition] = useState('');
  const [markerCoordinate, setMarkerCoordinate] = useState(null);

  const {location} = route.params;

  const getLocation = () => {
    if (location) {
      setPosition({
        lat: Number(location.latitude),
        lng: Number(location.longitude),
      });
      setMarkerCoordinate({
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      });
    } else {
      Geolocation.getCurrentPosition(position => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMarkerCoordinate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  };

  useEffect(() => {
    getLocation();
  }, []);
  // console.log(markerCoordinate);

  return (
    <View style={styles.container}>
      <View style={styles.innerView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Send Location</Text>
          <TouchableOpacity>
            <Ionicons name={'refresh-outline'} size={25} color={'green'} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
            placeholder="Search or enter an address"
          />
        </View>
        <View style={styles.mapContainer}>
          {position ? (
            <MapView
              style={styles.map}
              customMapStyle={darkMapStyle}
              initialRegion={{
                latitude: position.lat,
                longitude: position.lng,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
              }}>
              <Marker
                coordinate={markerCoordinate}
                title="You are here"
                draggable={true}
                onDragEnd={e => {
                  setMarkerCoordinate(e.nativeEvent.coordinate);
                }}>
                <Callout
                  tooltip={true}
                  onPress={() =>
                    navigation.navigate({
                      name: 'Msg',
                      params: {coords: markerCoordinate},
                      merge: true,
                    })
                  }>
                  <TouchableOpacity style={styles.calloutBubble}>
                    <Text style={styles.markerText}>Send this Location</Text>
                  </TouchableOpacity>
                </Callout>
              </Marker>
            </MapView>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      </View>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#000000' + '88',
  },
  innerView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    // paddingVertical: vh * 2,
    // paddingHorizontal: vw * 3,
    borderTopLeftRadius: vw * 3,
    borderTopRightRadius: vw * 3,
    width: '100%',
    backgroundColor: 'white',
    height: vh * 85,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    padding: vw * 3,
    marginBottom: vh * 1,
  },
  heading: {
    fontSize: 20,
  },
  cancelText: {
    color: 'green',
    fontSize: 18,
  },
  searchBar: {
    marginBottom: vh * 1,
    height: vh * 5,
    width: '100%',
    paddingHorizontal: vw * 3,
  },
  input: {
    height: '100%',
    borderWidth: vw * 0.5,
    borderRadius: vw * 4,
  },
  mapContainer: {
    height: '100%',
    width: '100%',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  markerText: {
    fontSize: vw * 5,
    color: '#26b551',
  },
  calloutBubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#4f5052',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: 15,
  },
});

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#263c3f',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6b9a76',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38414e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2f3948',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
];
