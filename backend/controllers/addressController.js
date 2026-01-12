const Address = require("../models/Address");

exports.addAddress = async (req,res)=>{
    const address = await Address.create({
        ...req.body,
        user: req.user._id
    });

    //Default Address
    const count = await Address.countDocuments({user: req.user._id});
    if(count === 1){
        address.isDefault = true;
        await address.save();
    }
    res.json(address);
};

exports.getMyAddresses() = async(req, res) => {
    const addresses = await Address.find({user: req.user._id}).sort({isDefault: -1, createdAt: -1});

    res.json(addresses);
};

exports.setDefaultAddress = async(req,res) => {
    await Address.updateMany(
        {user: req.user._id},
        {isDefault: false}
    );

    await Address.findByIdAndUpdate(req.params.id, {isDefault: true});

    res.json({message: "Default address updated"})
}

