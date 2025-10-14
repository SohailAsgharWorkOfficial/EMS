import { Balance } from "../models/Balance.model.js"

export const HandleCreateBalance = async (req, res) => {
    try {
        const { title, description, availableamount, totalexpenses, expensemonth } = req.body

        if (!title || !description || !availableamount || !totalexpenses || !expensemonth) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const balance = await Balance.findOne({
            expensemonth,
        })

        if (balance) {
            return res.status(409).json({ success: false, message: "Specific Balance Record already exists" })
        }

        const newbalance = await Balance.create({
            title,
            description,
            availableamount,
            totalexpenses,
            expensemonth,
            submitdate: new Date(),
            organizationID: req.ORGID,
            createdBy: req.HRid
        })

        return res.json({ success: true, message: "Balance record created successfully", balance: newbalance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllBalances = async (req, res) => {
    try {
        const balances = await Balance.find({ organizationID: req.ORGID })
        return res.status(200).json({ success: true, message: "All balances retrieved successfully", balances: balances })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleBalance = async (req, res) => {
    try {
        const { balanceID } = req.params
        const balance = await Balance.findOne({ _id: balanceID, organizationID: req.ORGID })

        if (!balance) {
            return res.status(404).json({ success: false, message: "Balance Record Not Found" })
        }

        return res.status(200).json({ success: true, message: "Balance Found Successfully", balance: balance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateBalance = async (req, res) => {
    try {
        const { balanceID, UpdatedData } = req.body
        const balance = await Balance.findByIdAndUpdate(balanceID, UpdatedData, { new: true })
        if (!balance) {
            return res.status(404).json({ success: false, message: "Balance Record not found" })
        }
        return res.status(200).json({ success: true, message: "Balance Record updated successfully", data: balance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteBalance = async (req, res) => {
    try {
        const { balanceID } = req.params
        const deletedBalance = await Balance.findByIdAndDelete(balanceID)
        if (!deletedBalance) {
            return res.status(404).json({ success: false, message: "Balance Record not found" })
        }
        return res.status(200).json({ success: true, message: "Balance Record deleted successfully" })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}