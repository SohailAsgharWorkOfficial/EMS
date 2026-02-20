import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
export const SalaryChart = ({ balancedata }) => {
    const balances = Array.isArray(balancedata?.balance) ? balancedata.balance : []
    const chartData = balances.map((item) => {
        const monthValue = item?.expensemonth ?? item?.expenseMonth ?? item?.month ?? ""
        const salariesPaid = Number(item?.totalexpenses ?? item?.totalExpenses ?? 0) || 0
        const availableAmount = Number(item?.availableamount ?? item?.availableAmount ?? 0) || 0

        return {
            month: String(monthValue),
            SalariesPaid: salariesPaid,
            AvailableAmount: availableAmount,
        }
    })
    const chartConfig = {
        SalariesPaid: {
            label: "Salaries Paid",
            color: "hsl(var(--chart-1))",
        },
        AvailableAmount: {
            label: "Available Balance",
            color: "hsl(var(--chart-2))",
        },
    }

    let trendingUp = 0
    if (chartData.length >= 2) {
        const latest = Number(chartData[chartData.length - 1]["AvailableAmount"]) || 0
        const previous = Number(chartData[chartData.length - 2]["AvailableAmount"]) || 0
        if (previous !== 0) {
            const difference = latest - previous
            trendingUp = Math.round((difference * 100) / previous)
        }
    }
    const latestAvailableAmount = chartData.length > 0 ? chartData[chartData.length - 1]["AvailableAmount"] : 0
    return (
        <div className="salary-container flex flex-col min-[250px]:gap-3 sm:gap-1 h-auto">
            <div className="heading px-2 my-2 min-[250px]:px-3">
                <h1 className="min-[250px]:text-xl xl:text-3xl font-bold min-[250px]:text-center sm:text-start">Balance Chart</h1>
            </div>
            <Card className="mx-2">
                <CardHeader>
                    <CardTitle className="min-[250px]:text-xs sm:text-md md:text-lg lg:text-xl">Available Salary Amount : {latestAvailableAmount.toLocaleString()}</CardTitle>
                    <CardDescription className="min-[250px]:text-xs sm:text-md md:text-lg lg:text-xl">
                        Salaries Chart
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No balance records found yet.</p>
                    ) : null}
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => String(value || "").slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" className="p-2" />}
                                className="p-[2px] flex gap-1 items-center min-[250px]:text-xs sm:text-xs"
                            />
                            <Area
                                dataKey="SalariesPaid"
                                type="natural"
                                fill="var(--color-SalariesPaid)"
                                fillOpacity={0.4}
                                stroke="var(--color-SalariesPaid)"
                                stackId="a"
                            />
                            <Area
                                dataKey="AvailableAmount"
                                type="natural"
                                fill="var(--color-AvailableAmount)"
                                fillOpacity={0.4}
                                stroke="var(--color-AvailableAmount)"
                                stackId="a"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 font-medium leading-none">
                                Trending up by {trendingUp} % this month
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-2 leading-none text-muted-foreground">
                                {chartData.length > 0 ? `${chartData[0]["month"]} - ${chartData[chartData.length - 1]["month"]}` : null}
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
