import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

/*
const healthChecker = (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { message: 'server still up and running' }));
  } catch (error) {}
};
*/

// this is the main logic of the healthcheck feature 

const healthChecker = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: 'server still up and running' }));
}) 

export default healthChecker;
