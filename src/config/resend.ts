// re_LaMzkwCt_56jfJr8xYEWnip4EQ14aX7tU
import { RESEND_API_KEY } from "../constants/env"
import { Resend } from "resend"

const resend = new Resend(RESEND_API_KEY)

export default resend
