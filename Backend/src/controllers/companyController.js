const { getAuth, getFirestore, admin } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');

exports.getCompanyAnalytics = async (req, res) => {
    const companyId = req.user.uid;
    const db = getFirestore();

    try {
        const productsSnapshot = await db.collection('products').where('companyId', '==', companyId).get();

        if (productsSnapshot.empty) {
            return res.status(200).json({
                success: true,
                data: {
                    totalViews: 0,
                    totalPlacements: 0,
                    totalWishlists: 0,
                    topProductsByViews: [],
                }
            });
        }

        let totalViews = 0;
        let totalPlacements = 0;
        let totalWishlists = 0;
        const products = [];

        productsSnapshot.forEach(doc => {
            const productData = doc.data();
            totalViews += productData.views || 0;
            totalPlacements += productData.placements || 0;
            totalWishlists += productData.wishlistCount || 0;
            products.push({
                id: doc.id,
                name: productData.name,
                views: productData.views || 0,
                placements: productData.placements || 0,
                wishlistCount: productData.wishlistCount || 0,
            });
        });

        const topProductsByViews = products.sort((a, b) => b.views - a.views).slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                totalViews,
                totalPlacements,
                totalWishlists,
                topProductsByViews,
            }
        });

    } catch (error) {
        console.error("Error fetching company analytics:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
    }
};