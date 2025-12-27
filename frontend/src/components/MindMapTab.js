import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import EmptyState from './EmptyState';

const { width, height } = Dimensions.get('window');

export default function MindMapTab({ image }) {
    if (!image || !image.image_url) {
        return <EmptyState message="No mind map available" icon="🗺️" />;
    }

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: image.image_url }}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height - 200,
    },
});
