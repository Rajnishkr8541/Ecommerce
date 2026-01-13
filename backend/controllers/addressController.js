const Address = require("../models/Address");

exports.addAddress = async (req,res)=>{
    try{
        const {name, phone, addressLine, city, state, pincode} = req.body;

        // first address = default
        const existing = await Address.find({user:req.user._id});
        const isDefault = existing.length === 0;

        const address = await Address.create({
            user: req.user._id,
            name,
            phone,
            addressLine,
            city,
            state,
            pincode,
            isDefault
        });

        res.status(201).json({
            message: "Address added successfully",
            address
        });
        
    }catch(error){
        console.error("ADD ADDRESS ERROR: ", error);
        res.status(500).json({message: "Failed to add address"})
    }
};

//Get user address
exports.getMyAddresses = async(req,res) => {
    try {
        const addresses = await Address.find({user: req.user._id}).sort({isDefault: -1});
        res.json(addresses);
    } catch (error) {
        res.status(500).json({message: "Failed to fetch addresses"});
    }
};

// SET default address
exports.setDefaultAddress = async(req, res) => {
    try {
        const addressId = req.params.id;

        await Address.updateMany(
            {user: req.user._id},
            {isDefault: false}
        );

       const address = await Address.findOneAndUpdate({_id:addressId, user: req.user._id}, {isDefault: true}, {new:true});

        res.json({message: "Default address updated",address})

    } catch (error) {
        res.status(500).json({message: "Failed to add default address"})
    }
};

