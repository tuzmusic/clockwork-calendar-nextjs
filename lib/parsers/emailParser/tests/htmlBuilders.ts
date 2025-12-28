export const buildHtml = (...parts: string[]) => `
      <body><table><tbody>
      <tr></tr>
      <tr></tr>
      <tr></tr>
      <tr></tr>
      ${parts.join('')}
      </tbody></table></body>
    `
export const buildEvent = ({
  dateNum,
  timeStr = '6:00-10:30',
  location = 'Some location',
}: {
  dateNum: number
  timeStr?: string
  location?: string
}) => `
      <tr>
        <td>&nbsp;</td>
        <td><strong>${dateNum}</strong></td>
        <td>&nbsp;</td>
        <td> ${timeStr} 
        </td>
        <td>
          <strong>CEC</strong> &nbsp;
          ${location}
        </td>
      </tr>
`
export const buildMonthHeader = (month: string, year = 2024) =>
  [`<tr><td>___________</td></tr>`,
  `<tr><td><strong>${month}, ${year}</strong></td></tr>`].join('\n')

export const buildOtherPart = ({
  timeStr,
  part,
  details = 'Jonathan (Keys)',
}: {
  timeStr: string
  part: string
  details?: string
}) =>
  `
<tr>
  <td colspan="3" valign="top">&nbsp;</td>
  <td colspan="2" valign="top">
    <span
      style="
        color: #00f;
        font-style: italic;
        font-size: 11px;
      "
    >
      <strong>${part}</strong>,
      ${timeStr}: ${details}
    </span>
  </td>
</tr>
`
