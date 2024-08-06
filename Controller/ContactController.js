import ContactModel from "../models/ContactModel.js";

export const addContact = async (req, res) => {
  try {
    const { title, Descriptions, Link } = req.body;

    const NewContact = new ContactModel({
      title,
      Descriptions,
      Link,
    });
    await NewContact.save();
    res.status(201).json({
      success: true,

      message: "Contact added successfully",
      announcement: NewContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding Contact",
      error,
    });
  }
};

// Get notifications
export const getContact = async (req, res) => {
  try {
    const Contact = await ContactModel.find({});
    res
      .status(200)
      .json({ success: true, TotalContact: Contact.length, Contact });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error,
    });
  }
};

// Delete notification
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedContact = await ContactModel.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      Contact: deletedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error,
    });
  }
};
