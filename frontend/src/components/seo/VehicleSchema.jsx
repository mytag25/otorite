import React from 'react';

const VehicleSchema = ({ vehicle }) => {
    if (!vehicle) return null;

    const brandName = vehicle.brand.charAt(0).toUpperCase() + vehicle.brand.slice(1);
    const fullName = `${brandName} ${vehicle.model} (${vehicle.year})`;

    // SEO structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Car",
        "name": fullName,
        "image": vehicle.images?.[0] || vehicle.image,
        "description": vehicle.editorial?.summary?.tr || vehicle.bestFor?.tr || `${fullName} incelemiş ve puanlaması.`,
        "brand": {
            "@type": "Brand",
            "name": brandName
        },
        "model": vehicle.model,
        "vehicleModelDate": vehicle.year,
        "vehicleEngine": {
            "@type": "EngineSpecification",
            "name": vehicle.specs?.engine
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": vehicle.scores?.overall?.score || 0,
            "bestRating": "10",
            "worstRating": "1",
            "ratingCount": "1" // Şu anlık editör puanı olarak 1 sayıyoruz
        },
        "review": {
            "@type": "Review",
            "author": {
                "@type": "Person",
                "name": "Otorite Editör"
            },
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": vehicle.scores?.overall?.score || 0,
                "bestRating": "10",
                "worstRating": "1"
            },
            "reviewBody": vehicle.editorial?.verdict?.tr || vehicle.editorial?.summary?.tr || ""
        }
    };

    // Teknik detayları ekle
    if (vehicle.specs) {
        if (vehicle.specs.power) jsonLd.vehicleEngine.enginePower = {
            "@type": "QuantitativeValue",
            "value": vehicle.specs.power
        };
        if (vehicle.specs.acceleration) jsonLd.accelerationTime = {
            "@type": "QuantitativeValue",
            "value": vehicle.specs.acceleration,
            "unitCode": "SEC"
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
};

export default VehicleSchema;
