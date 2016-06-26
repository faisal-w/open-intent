#include "BeerBar.hpp"

class StdOutputWriter : public OutputWriter
{
public:
    StdOutputWriter& operator<<(const std::string &output)
    {
        std::cout << output;
        return *this;
    }
};

class StdInputReader : public InputReader
{
public:
    StdInputReader& operator>>(std::string &input)
    {
        std::getline(std::cin, input);
        return *this;
    }
};

int main(int argc, char **argv)
{
    StdOutputWriter outputWriter;
    StdInputReader inputReader;

    BeerBar::run(inputReader, outputWriter);
    return 0;
}

