const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('Backend is running...');
});



const {
    SERVICENOW_INSTANCE,
    SERVICENOW_USERNAME,
    SERVICENOW_PASSWORD,
    SERVICENOW_TABLE,
    SERVICENOW_ISSUE_TABLE,
} = process.env;
//signup
app.post('/signup', async (req, res) => {
    try {
        const { username, email_or_phone, password } = req.body;

        if (!username || !email_or_phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // ✅ Use the correct field name used in ServiceNow (likely u_email_or_phone)
        const checkResponse = await axios.get(
            `${SERVICENOW_INSTANCE}/api/now/table/${SERVICENOW_TABLE}?sysparm_query=u_email=${email_or_phone}`,
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (checkResponse.data.result.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Send to ServiceNow
        const response = await axios.post(
            `${SERVICENOW_INSTANCE}/api/now/table/${SERVICENOW_TABLE}`,
            {
                u_username: username,
                u_email: email_or_phone,
                u_password: hashedPassword
            },
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        return res.status(201).json({ message: 'User registered successfully', result: response.data.result });

    } catch (error) {
        console.error('Sign Up Error:', error.response?.data || error.message);
        return res.status(500).json({
            message: 'Sign Up failed',
            error: error.response?.data || error.message
        });
    }
});


//login

app.post('/signin', async (req, res) => {
    try {
        const { email_or_phone, password } = req.body;

        if (!email_or_phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const checkResponse = await axios.get(
            `${SERVICENOW_INSTANCE}/api/now/table/${SERVICENOW_TABLE}?sysparm_query=u_email=${email_or_phone}`,
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        const user = checkResponse.data.result[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("Entered Password:", password);
        console.log("Stored Hashed Password from ServiceNow:", user.u_password);
        console.log("Table name:", SERVICENOW_TABLE);

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.u_password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        return res.status(200).json({
            message: 'Login successful',
            user: {
                username: user.u_username,
                email_or_phone: user.u_email,
            }
        });

    } catch (error) {
        console.error('Sign In Error:', error.response?.data || error.message);
        return res.status(500).json({
            message: 'Sign In failed',
            error: error.response?.data || error.message
        });
    }
});

//forgot-password

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    try {
        // Step 1: Get user from ServiceNow
        const getUserResponse = await axios.get(
            `${SERVICENOW_INSTANCE}/api/now/table/u_canteen_user?sysparm_query=u_email=${email}&sysparm_limit=1`,
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        const users = getUserResponse.data.result;

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        const sys_id = user.sys_id;

        // Step 2: Generate OTP and expiry
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        const formattedExpiry = expiry.toISOString().replace('T', ' ').substring(0, 19);
        console.log("Formatted expiry for SN:", formattedExpiry);

        const patchPayload = {
            u_reset_otp: otp,
            u_reset_otp_expiry: formattedExpiry,
        };

        console.log('Sending PATCH to SN with:', patchPayload);

        await axios.patch(
            `${SERVICENOW_INSTANCE}/api/now/table/u_canteen_user/${sys_id}`,
            patchPayload,
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`OTP for ${email}: ${otp}`);

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp, // For testing only (remove in production)
        });

    } catch (err) {
        console.error('Forgot password error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});


//verify-otp

// Add this in your Node.js backend (server.js or app.js file)

app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    try {
        // Get user from ServiceNow
        const getUserResponse = await axios.get(
            `${SERVICENOW_INSTANCE}/api/now/table/u_canteen_user?sysparm_query=u_email=${email}&sysparm_limit=1`,
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        const users = getUserResponse.data.result;

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        const storedOTP = user.u_reset_otp;
        const expiry = new Date(user.u_reset_otp_expiry.replace(' ', 'T') + 'Z');
        const now = new Date();
        // console.log("Current time:", now.toISOString());
        // console.log("Parsed expiry:", expiry.toISOString());
        if (String(storedOTP).trim() !== otp.trim()) {
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }
        // console.log("Current time:", new Date().toISOString());
        // console.log("Stored expiry:", user.u_reset_otp_expiry);
        // console.log("Type of entered OTP:", typeof otp);
        // console.log("Type of stored OTP:", typeof storedOTP);


        if (now > expiry) {
            return res.status(410).json({ success: false, message: 'OTP expired' });
        }

        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Verify OTP error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// reset-password


app.post('/reset-password/:email', async (req, res) => {
    const { email } = req.params;
    const { password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    try {
        // Step 1: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password being sent:", hashedPassword);

        // Step 2: Fetch user
        const getUserResponse = await axios.get(
            `${SERVICENOW_INSTANCE}/api/now/table/u_canteen_user?sysparm_query=u_email=${email}&sysparm_limit=1`,
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: { 'Accept': 'application/json' },
            }
        );

        const users = getUserResponse.data.result;
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // Step 3: Update password in SN
        await axios.patch(
            `${SERVICENOW_INSTANCE}/api/now/table/u_canteen_user/${user.sys_id}`,
            {
                u_password: hashedPassword,
                u_reset_otp: '',
                u_reset_otp_expiry: '',
            },
            {
                auth: {
                    username: SERVICENOW_USERNAME,
                    password: SERVICENOW_PASSWORD,
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );

        return res.status(200).json({ success: true, message: 'Password reset successfully' });

    } catch (err) {
        console.error("Reset password error:", err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

//order

const encodeAuth = (username, password) => {
  return Buffer.from(`${username}:${password}`).toString("base64");
};

const orderTable = process.env.SERVICENOW_ORDER_TABLE;
const summaryTable = "u_oder_summary";

app.post("/confirm-order", async (req, res) => {
  const { cartItems, token, userEmail: email, userName: username } = req.body;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !token) {
    return res.status(400).json({ message: "Missing cart items or token" });
  }

  try {
    const nowUtc = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(nowUtc.getTime() + istOffsetMs);
    const istISOString = istDate.toISOString();

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Basic " + encodeAuth(SERVICENOW_USERNAME, SERVICENOW_PASSWORD),
    };

   for (const item of cartItems) {
  const price = Number(item.price) || 0;
  const qty = item.quantity || 1;
  const total = price * qty;

 const itemPayload = {
  u_item_name: item.name,
  u_quantity: qty,
  u_item_price: price,
  u_total_price: total,
  u_token: token,
  u_created_on: istISOString,
  u_email: email,
  u_username: username,
//   u_start_time:TimeRanges,
//   u_end_time:TimeRanges,
  u_availability: item.availability || "Not specified",
  u_item_type: item.item_type || "Not specified",
  u_canteen_name: item.canteen_name || "Not specified", // ✅ Add this line
};




  await axios.post(`${SERVICENOW_INSTANCE}/api/now/table/${orderTable}`, itemPayload, {
    headers,
  });
}


    // ✅ Save order summary
    const summaryPayload = {
      u_token: token,
      u_email: email,
      u_username: username,
      u_total_items: cartItems.length,
      u_order_status: "Confirmed",
      u_created_on: istISOString,
    };

    await axios.post(`${SERVICENOW_INSTANCE}/api/now/table/${summaryTable}`, summaryPayload, {
      headers,
    });

    res.status(201).json({ message: "All items and summary saved successfully" });
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to save order", error: error.message });
  }
});

//raise issue

const authHeader = 'Basic ' + Buffer.from(`${SERVICENOW_USERNAME}:${SERVICENOW_PASSWORD}`).toString('base64');

// ✅ ROUTE TO RAISE ISSUE
app.post('/raise-issue', async (req, res) => {
  const { email, username, issue_type, description, order_id } = req.body;
    console.log("🔥 Raising issue for:", email); // For debugging
  console.log("🧠 Auth header:", authHeader);   
  console.log('Received issue_type:', issue_type);

  try {
    const payload = {
      u_usermail: email,
      u_username: username,
      u_issue_type: issue_type,
      u_description: description,
      u_order_id: order_id || '',
      u_status: 'new'
    };

    console.log("📤 Payload to SN:", payload);


    const snResponse = await axios.post(`${SERVICENOW_INSTANCE}/api/now/table/${SERVICENOW_ISSUE_TABLE}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    res.status(200).json({ message: '✅ Issue raised', data: snResponse.data });
  } catch (error) {
    console.error('❌ Error:', error?.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to raise issue',
      details: error?.response?.data || error.message
    });
  }
});


// ✅ GET /get-issues?email=user@example.com
app.get("/get-issues", async (req, res) => {
  const email = req.query.email;
  const authHeader = 'Basic ' + Buffer.from(`${SERVICENOW_USERNAME}:${SERVICENOW_PASSWORD}`).toString('base64');

  try {
    const response = await axios.get(
      `${SERVICENOW_INSTANCE}/api/now/table/u_canteen_issues?sysparm_query=u_useremail=${email}&sysparm_display_value=true`,
      { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
    );

    const issues = response.data.result.map(item => ({
      id: item.sys_id,
      issue_type: item.u_issue_type,
      description: item.u_description,
      order_id: item.u_order_id,
      status: item.u_status,
      created_on: item.u_created_on
    }));

    res.json(issues);
  } catch (error) {
    console.error("Issue fetch error:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});


app.listen(3101, () => console.log(`Server running on port 3101`));

// app.get('/ping', (req, res) => {
//     res.json({ message: 'pong' });
// });
