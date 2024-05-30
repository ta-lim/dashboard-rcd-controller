import { format } from "morgan";

class RcdValidator {
  createDataScheme = {
    type: "object",
    properties: {
      title: {
        type: "string",
        minLength: 1,
        maxLength: 255,
        nullable: false,
      },
      picOne: {
        type: "string",
        minLength: 1,
        maxLength: 40,
        nullable: false,
      },
      picTwo: {
        type: "string",
        minLength: 0,
        maxLength: 40,
        nullable: true,
      },
      UIC: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        nullable: false,
      },
      description: {
        type: "string",
        minLength: 1,
        nullable: false,
      },
      crNumber: {
        type: "string",
        minLength: 3,
        maxLength: 45,
        nullable: false,
      },
      status: {
        type: "string",
        enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        nullable: false,
      },
      // timeline: { type: "string", format: 'date-time', futureDate:true }, // Value should be a string representing a date,
      timeline: { type: "string", format: "date", futureDate: true },
      category: {
        type: "string",
        enum: ["1", "2", "3"],
        nullable: false,
      },
    },
    required: [
      "title",
      "picOne",
      "picTwo",
      "UIC",
      "crNumber",
      "description",
      "status",
      "timeline",
      "category",
    ],
    // additionalProperties: false,
  };

  updateDataScheme = {
    type: "object",
    properties: {
      id: {
        type: "integer",
        // minLength: 1,
        // maxLength: 3
      },
      title: {
        type: "string",
        minLength: 1,
        maxLength: 255,
        nullable: false,
      },
      picOne: {
        type: "string",
        minLength: 1,
        maxLength: 40,
        nullable: false,
      },
      picTwo: {
        type: "string",
        minLength: 0,
        maxLength: 40,
        nullable: true,
      },
      UIC: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        nullable: false,
      },
      description: {
        type: "string",
        minLength: 1,
        nullable: false,
      },
      crNumber: {
        type: "string",
        minLength: 3,
        maxLength: 45,
        nullable: false,
      },
      status: {
        type: "string",
        enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        nullable: false,
      },
      timeline: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$", // Value should be a string representing a date
      },
      category: {
        type: "string",
        enum: ["1", "2"],
        nullable: false,
      },
    },
    required: [
      "id",
      "title",
      "picOne",
      "picTwo",
      "UIC",
      "crNumber",
      "description",
      "status",
      "timeline",
      "category",
    ],
    // additionalProperties: false,
  };

  updateStatusScheme = {
    properties: {
      id: {
        type: "integer",
        // minLength: 1,
        // maxLength: 3
      },
      status: {
        type: "string",
        enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        nullable: false,
      },
      category: {
        type: "string",
        enum: ["1", "2", "3"],
        nullable: false,
      },
    },
    required: ["id", "status", "category"],
    additionalProperties: true,
  };
}

export default RcdValidator;
