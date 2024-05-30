import RcdModel from "../../models/Rcd.model.js";

import ExcelJS from "exceljs";
import { Op, where } from "sequelize";
import FileSystemHelper from "../../helpers/FileSystem.helper.js";
import { scheduleJob } from "node-schedule";

class RcdService {
  constructor(server) {
    this.server = server;
    this.FileSystemHelper = new FileSystemHelper(this.server);
    this.RcdModel = new RcdModel(this.server).table;

    this.setStatusCountdownJob();
  }

  setStatusCountdownJob() {
    // Set the scheduler to run once per day at a specific time, for example, at 8 AM
    scheduleJob("10 * * * *", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight to compare only the date part

      // Find activities where the timelineActivity is today or in the past but not yet marked as "Over SLA"
      const overdueActivities = await this.RcdModel.findAll({
        where: {
          timeline: {
            [Op.lte]: today, // Find activities with timelineActivity in the past or today
          },
          status: {
            [Op.not]: "10", // Change 'Over SLA' to whatever status represents being overdue
          },
          category: "2",
        },
      });

      // Update status to 'Over SLA' for each overdue activity
      for (let activity of overdueActivities) {
        await this.RcdModel.update(
          { status: "10" }, // Change 'Over SLA' to your actual overdue status identifier
          { where: { id: activity.id } }
        );
        console.log(`Activity '${activity.title}' is now overdue.`);
      }
    });
  }

  async createData(data) {

    const addDataRcdModel = await this.RcdModel.create({
      title: data.title,
      picOne: data.picOne,
      picTwo: data.picTwo,
      UIC: data.UIC,
      description: data.description,
      crNumber: data.crNumber,
      status: data.status,
      timeline: data.timeline,
      category: data.category,
    });

    return 1;
  }

  async getAllData(category) {
    const getDataRcd = await this.RcdModel.findAll({
      where: {
        category,
      },
      order: [
        ["status", "DESC"],
        // ["timeline", "ASC"],
        ["picOne", "ASC"],
      ],
    });

    return getDataRcd;
  }

  async getDetail(id) {
    const getDetailRcd = await this.RcdModel.findOne({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: {
        id,
      },
    });

    return getDetailRcd;
  }

  async updateData(data) {
    const updateDataRcd = await this.RcdModel.update(
      {
        title: data.title,
        picOne: data.picOne,
        picTwo: data.picTwo,
        UIC: data.UIC,
        description: data.description,
        crNumber: data.crNumber,
        status: data.status,
        timeline: data.timeline
      },
      {
        where: {
          id: data.id,
        },
      }
    );

    return 1;
  }

  async updateStatus(data) {
    const updateStatus = await this.RcdModel.update(
      {
        status: data.status,
      },
      {
        where: {
          id: data.id,
        },
      }
    );

    return 1;
  }

  async deleteData(id) {
    const deleteaDataRcd = await this.RcdModel.destroy({
      where: {
        id,
      },
    });

    return 1;
  }

  async getAnalyze(category) {
    const getAnalyze = await this.RcdModel.count({
      where: {
        category,
      },
      group: ["status"],
    });

    const getRank = await this.RcdModel.count({
      where: {
        category,
      },
      group: ["picOne", "status"],
    });

    const onProgress = await getAnalyze.filter((item) =>
      ["1", "2", "3", "4", "5", "8"].includes(item.status)
    );
    const pending = await getAnalyze.filter((item) =>
      ["7", "10"].includes(item.status)
    );
    const done = await getAnalyze.filter((item) =>
      ["6", "9"].includes(item.status)
    );

    function calculateRankSum(arr) {
      const result = arr.reduce((acc, current) => {
        if (!acc[current.picOne]) {
          acc[current.picOne] = { count: 0 };
        }
        acc[current.picOne].count += current.count;
        return acc;
      }, {});

      const sortedData = Object.keys(result).map((name) => ({
        name,
        count: result[name].count,
      }));

      sortedData.sort((a, b) => b.count - a.count);

      return sortedData;
    }

    const onProgressSum = await onProgress.reduce(
      (total, item) => total + item.count,
      0
    );

    const summary = {
      onProgress: onProgressSum,
      pending: pending.length > 0 ? pending[0].count : 0,
      done: done.length > 0 ? done[0].count : 0,
      total: getAnalyze.reduce((total, item) => total + item.count, 0),
    };
    const onProgressRank = calculateRankSum(
      getRank.filter((item) =>
        ["1", "2", "3", "4", "5", "8"].includes(item.status)
      )
    );
    const pendingRank = calculateRankSum(
      getRank.filter((item) => ["7", "10"].includes(item.status))
    );
    const doneRank = calculateRankSum(
      getRank.filter((item) => ["6", "9"].includes(item.status))
    );
    function transformData(onProgressRank, pendingRank, doneRank) {
      // Helper function to add counts to the aggregation object
      function addCounts(rank, counts) {
        rank.forEach(({ name, count }) => {
          counts[name] = (counts[name] || 0) + count;
        });
      }
      // Aggregate the counts for each name
      const totalCounts = {};
      addCounts(onProgressRank, totalCounts);
      addCounts(pendingRank, totalCounts);
      addCounts(doneRank, totalCounts);

      // Sort names by their total count
      const sortedNames = Object.keys(totalCounts).sort(
        (a, b) => totalCounts[b] - totalCounts[a]
      );

      // Initialize statusData with empty arrays
      const statusData = {
        "On Progress": new Array(sortedNames.length).fill(0),
        Pending: new Array(sortedNames.length).fill(0),
        Done: new Array(sortedNames.length).fill(0),
      };

      // Helper function to populate statusData based on sorted names
      function populateStatusData(rank, status) {
        rank.forEach(({ name, count }) => {
          const index = sortedNames.indexOf(name);
          statusData[status][index] = count;
        });
      }

      // Populate statusData with counts from each rank
      populateStatusData(onProgressRank, "On Progress");
      populateStatusData(pendingRank, "Pending");
      populateStatusData(doneRank, "Done");

      // Transform statusData into the desired format
      const transformedData = Object.entries(statusData).map(
        ([name, data]) => ({
          name,
          data,
        })
      );

      return { transformedData, sortedNames };
    }

    const transformedData = transformData(
      onProgressRank,
      pendingRank,
      doneRank
    );

    const summaryRank = {
      onProgress: onProgressRank,
      pending: pendingRank,
      done: doneRank,
      total: transformedData,
    };
    return { summary, summaryRank };
  }

  async search(title, category) {
    if (category === "undefined") return -1;    

    const searchTitle = await this.RcdModel.findAll({
      where: {
        title: {
          [Op.substring]: `%${title}%`,
        },
        category,
      },
    });

    return searchTitle;
  }

  async masterDataFilter(category) {
    const masterDataPicOne = await this.RcdModel.findAll({
      attributes: ["picOne"],
      group: ["picOne"],
      where: { category },
    });

    const masterDataUIC = await this.RcdModel.findAll({
      attributes: ["UIC"],
      group: ["UIC"],
      where: { category },
    });

    const masterDataStatus = await this.RcdModel.findAll({
      attributes: ["status"],
      group: "status",
      where: { category },
    });

    return {
      masterDataPicOne,
      masterDataStatus,
      masterDataUIC,
    };
  }
  async filterData(options) {
    const whereClause = {};

    for (const key in options) {
      // Check if the value is provided and not null
      if (options[key] !== undefined && options[key] !== null) {
        // Add the parameter to the where clause
        whereClause[key] = options[key];
      }
    }
    const filterData = await this.RcdModel.findAll({
      where: whereClause,
    });
    return filterData;
  }

  async downloadData(category) {
    const dataRcd = await this.RcdModel.findAll({
      order: [
        ["status", "ASC"],
        ["timeline", "ASC"],
      ],
      where: {
        category,
      },
    });

    const workBook = new ExcelJS.Workbook();
    const workSheet = workBook.addWorksheet("Data Project");

    workSheet.columns = [
      { header: "Title", id: "title", width: 30 },
      { header: "PIC 1", id: "picOne" },
      { header: "PIC 2", id: "picTwo" },
      { header: "UIC", id: "UIC" },
      { header: "Description", id: "description", width: 30 },
      { header: "CR Number", id: "crNumber" },
      { header: "Status", id: "status" },
      { header: "Timeline", id: "timeline" },
    ];
    workSheet.getColumn("A").alignment = {
      wrapText: true,
      horizontal: "center",
      vertical: "middle",
    };
    workSheet.getColumn("E").alignment = {
      wrapText: true,
      horizontal: "left",
      vertical: "middle",
    };
    // workSheet.getColumn(['B', 'C', 'D', 'F', 'G', 'H']).alignment = {vertical: 'middle', horizontal: 'center'}
    const statusMap = new Map([
      ["1", "Design"],
      ["2", "Development"],
      ["3", "Testing"],
      ["4", "Promote"],
      ["5", "PIR"],
      ["6", "Go Live"],
      ["7", "Requirement"],
      ["8", "Pending Over SLA"],
      ["9", "Pending On SLA"],
      ["10", "Done"],
    ]);
    const formatDate = (dateString, format) => {
      const date = new Date(dateString);
      const options =
        format === "MMMM-yyyy"
          ? { year: "numeric", month: "long" }
          : { day: "2-digit", month: "long", year: "numeric" };
      return new Intl.DateTimeFormat("en-GB", options).format(date);
    };
    // const timelineMap = new Map([
    //   ["1", "Q1 - 2024"],
    //   ["2", "Q2 - 2024"],
    //   ["3", "Q3 - 2024"],
    //   ["4", "Q4 - 2024"],
    // ]);

    dataRcd.forEach((data) => {
      console.log(data);
      const timelineValue =
        category === "1"
          ? formatDate(data.timeline, "MMMM-yyyy")
          : formatDate(data.timeline, "dd-MMMM-yyyy");

      workSheet.addRow([
        data.title,
        data.picOne,
        data.picTwo,
        data.UIC,
        data.description,
        data.crNumber,
        statusMap.get(data.status),
        timelineValue,
      ]);
    });

    await workBook.xlsx.writeFile(`./server_data/data.xlsx`);

    return {
      title: "data",
      ...(await this.FileSystemHelper.readFile("/server_data/data.xlsx")),
    };
  }
}

export default RcdService;
