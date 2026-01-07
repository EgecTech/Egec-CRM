import { mongooseConnect } from "@/lib/mongoose";
import { Contact } from "@/models/contact";

export default async function handle(req, res) {
  try {
    await mongooseConnect();

    const { method } = req;

    switch (method) {
      case "POST": {
        const {
          name,
          lname,
          email,
          company,
          phone,
          country,
          price,
          description,
          project,
        } = req.body;

        if (!name || !lname || !email || !company || !phone) {
          return res.status(400).json({ error: "Required fields are missing" });
        }

        if (tags && !Array.isArray(tags)) {
          return res.status(400).json({ error: "Tags must be an array" });
        }

        const newContact = await Contact.create({
          name,
          lname,
          email,
          company,
          phone,
          country,
          price,
          description,
          project,
        });

        return res.status(201).json(newContact);
      }

      case "GET": {
        if (req.query?.id) {
          const contact = await Contact.findById(req.query.id).lean();
          if (!contact)
            return res.status(404).json({ error: "Contact not found" });
          return res.json(contact);
        }

        const contacts = await Contact.find().sort({ _id: -1 }).lean();
        return res.json(contacts);
      }

      case "PUT": {
        const {
          _id,
          name,
          lname,
          email,
          company,
          phone,
          country,
          price,
          description,
          project,
        } = req.body;

        if (!_id)
          return res.status(400).json({ error: "Contacts ID is required" });

        const updatedContact = await Contact.findByIdAndUpdate(
          _id,
          {
            name,
            lname,
            email,
            company,
            phone,
            country,
            price,
            description,
            project,
          },
          { new: true, lean: true }
        );

        if (!updatedContact)
          return res.status(404).json({ error: "Contact not found" });

        return res.json(updatedContact);
      }

      case "DELETE": {
        const { id } = req.query;
        if (!id)
          return res
            .status(400)
            .json({ error: "Contact ID is required for deletion" });

        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact)
          return res.status(404).json({ error: "Contact not found" });

        return res.json({
          success: true,
          message: "Contact deleted successfully",
        });
      }

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}
