import { ExpansesOverviewByPayer, ExpensesOverview, OverflowToCredit, ReportParamsByCompetenceDto, ReportParamsByPeriodDto } from '../../shared/dtos/report.dto';

export interface IReportService {
  expensesOverview(params: ReportParamsByCompetenceDto): Promise<ExpensesOverview>
  overflowToCredit(params: ReportParamsByCompetenceDto): Promise<OverflowToCredit>
  expansesOverviewByPayer(params: ReportParamsByCompetenceDto): Promise<ExpansesOverviewByPayer[]>
  expansesOverviewByPeriodAndPayer(params: ReportParamsByPeriodDto): Promise<ExpansesOverviewByPayer[]>
  expansesOverviewByPeriod(params: ReportParamsByPeriodDto): Promise<ExpansesOverviewByPayer[]>
}

